---
title: 'InheritableThreadLocal：继承只发生在线程创建时'
slug: 'inheritable-thread-local-inheritance-semantics'
excerpt: '从 JDK 文档、childValue 默认实现和最小实验出发，说明 InheritableThreadLocal 的一次性继承时机与对象引用语义。'
publishedAt: '2026-08-31'
tags: ['Java', 'InheritableThreadLocal', 'ThreadLocal', '并发']
category: 'Java 工程'
featured: false
draft: false
---

# InheritableThreadLocal：继承只发生在线程创建时

`InheritableThreadLocal` 经常被概括为“可以把父线程的值传给子线程”。这句话没有错，但省略了最重要的限制：它传递的是子线程创建时的初始值，不是一个会持续同步的上下文。

理解这个时间点，才能判断它适合临时子线程，还是会在线程池、异步框架和长生命周期线程中留下过期状态。

## 先从 ThreadLocal 说起

`ThreadLocal` 并不是一个由所有线程共同读写的全局变量。每个线程都在自己的线程本地存储中保存与这个变量对应的值：

```java
private static final ThreadLocal<String> CONTEXT_A = new ThreadLocal<>();
```

线程 A 调用 `CONTEXT_A.set("A")`，不会让线程 B 的 `CONTEXT_A.get()` 返回 `"A"`。即使两个线程访问的是同一个静态变量，它们读取的也是各自线程中的条目。

`InheritableThreadLocal` 在这个模型上增加了一次初始化机会：创建子线程时，可以使用父线程当时的值，计算子线程的初始值。

## JDK 文档中的两个关键词

![InheritableThreadLocal 的 JDK 类注释与 childValue 方法注释](images/inheritable-thread-local-jdk-comment.png '继承发生在子线程创建时，子线程得到的是初始值')

JDK 类注释中的两个关键词决定了它的行为边界：

- **a child thread is created**：触发点是子线程创建；
- **initial values**：得到的是子线程自己的初始值。

这意味着它没有承诺以下行为：

- 父线程每次修改值时自动通知子线程；
- 子线程每次开始执行任务时重新读取父线程；
- 一个已经存在的线程因为接收到新任务而重新继承；
- 父线程清理自己的值时同时清理子线程。

继承完成后，父线程和子线程仍然分别从自己的线程本地存储中读取条目。

## childValue 在何时执行

JDK 对 `childValue()` 的描述更具体：它根据子线程创建时的父线程值计算初始值，并且在父线程内部、子线程启动之前调用。

默认实现等价于：

```java
protected T childValue(T parentValue) {
    return parentValue;
}
```

因此，默认行为不是重新查询父线程，也不是创建深副本，而是把传入的值直接作为子线程的初始值。

下面的实验可以区分“创建线程”和“启动线程”这两个时间点：

```java
InheritableThreadLocal<String> contextA = new InheritableThreadLocal<>();

contextA.set("A");
Thread threadA = new Thread(() -> System.out.println(contextA.get()));

contextA.set("B");
threadA.start();
threadA.join();
```

子线程输出的是 `A`，不是 `B`。`new Thread(...)` 创建线程时已经完成初始值计算；随后父线程调用 `set("B")`，不会改写子线程已经得到的值。

把父线程的第二次 `set()` 换成 `remove()`，结论也相同：父线程删除的是自己的条目，子线程的条目仍然存在。

## 默认实现可能共享对象引用

当值是字符串等不可变对象时，父子线程拿到相同对象通常不会造成对象内部状态竞争。值是可变对象时，默认实现的风险更明显：

```java
InheritableThreadLocal<Map<String, String>> contextA =
    new InheritableThreadLocal<>();

Map<String, String> dataA = new HashMap<>();
dataA.put("keyA", "valueA");
contextA.set(dataA);
```

默认 `childValue()` 返回的就是 `dataA`。父线程和子线程虽然分别保存了线程本地条目，条目指向的却可能是同一个 `Map`。

可以通过重写 `childValue()` 创建副本：

```java
InheritableThreadLocal<Map<String, String>> contextA =
    new InheritableThreadLocal<>() {
        @Override
        protected Map<String, String> childValue(Map<String, String> parentValue) {
            return parentValue == null ? null : new HashMap<>(parentValue);
        }
    };
```

这可以隔离后续的 `Map` 修改，但不能改变继承时机。子线程拿到的仍然只是创建那一刻的副本。

## remove 只作用于当前线程

`InheritableThreadLocal` 继承自 `ThreadLocal`，因此 `remove()` 的作用域仍是当前线程：

```java
try {
    contextA.set("A");
    runDataA();
} finally {
    contextA.remove();
}
```

这个 `finally` 对当前线程是必要的，但它不能隔空删除其他线程已经继承的条目。其他线程必须在自己的执行边界中清理自己的值。

## 适用边界

`InheritableThreadLocal` 更适合满足以下条件的场景：

- 子线程确实由当前线程创建；
- 子线程只服务于当前工作单元；
- 父子线程生命周期关系清晰；
- 只需要创建时的一次初始值；
- 子线程结束后不再处理其他调用者的工作。

一旦线程会长期存活、跨请求复用或接收来自多个调用者的任务，就不能把“线程创建时继承”误认为“任务提交时传播”。这类组合风险应在线程池层面单独分析。

## 快速判断

看到 `InheritableThreadLocal` 时，可以依次确认：

1. 哪一行代码真正创建了子线程？
2. 创建线程时，父线程里保存的值是什么？
3. 子线程之后是否会被复用？
4. 值是不可变对象、浅副本还是共享可变对象？
5. 哪个线程负责执行 `remove()`？

如果这些问题无法从代码中直接回答，说明上下文生命周期已经不够明确。

## 相关知识

- [共享线程池为什么会放大线程上下文风险](/knowledge/thread-pool-context-propagation/)

## 参考资料

- [Java SE 8：InheritableThreadLocal](https://docs.oracle.com/javase/8/docs/api/java/lang/InheritableThreadLocal.html)
- [Java SE 8：ThreadLocal](https://docs.oracle.com/javase/8/docs/api/java/lang/ThreadLocal.html)
- [Java SE 8：Thread](https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html)
