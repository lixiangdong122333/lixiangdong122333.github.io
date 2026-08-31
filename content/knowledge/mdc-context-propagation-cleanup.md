---
title: 'MDC：线程池中的日志上下文传播与清理'
slug: 'mdc-context-propagation-cleanup'
excerpt: '梳理 SLF4J MDC 的职责与核心 API，并给出在线程池中捕获、安装和恢复日志上下文的完整模式。'
publishedAt: '2026-08-31'
tags: ['SLF4J', 'MDC', 'Logback', '线程池', '可观测性']
category: '可观测性'
featured: false
draft: false
---

# MDC：线程池中的日志上下文传播与清理

MDC 是 Mapped Diagnostic Context 的缩写。它允许应用把 `traceId`、请求标识等诊断字段与当前执行上下文关联，再由日志格式统一输出。

MDC 解决的是“这条日志属于哪个诊断上下文”，不是“这次查询可以访问哪些数据”。它适合丰富日志，不应成为用户身份、租户边界或授权判断的唯一来源。

## MDC 是门面，不是固定存储实现

SLF4J 的 `MDC` 是静态门面，实际操作会委托给运行时绑定提供的 `MDCAdapter`。不同日志绑定、SLF4J 版本或适配器可能采用不同的内部存储策略。

因此，不应脱离运行环境笼统声称：

- MDC 一定使用普通 `ThreadLocal`；
- MDC 一定使用 `InheritableThreadLocal`；
- MDC 一定会自动传给子线程；
- MDC 一定会在执行器任务之间传播。

可移植的做法是只依赖 MDC API，并在明确的异步边界显式捕获和恢复上下文。

## 核心 API

### put、get 和 remove

`put()` 在当前线程的 MDC 中设置一个字符串键值，`get()` 读取当前线程对应的值，`remove()` 删除一个键：

```java
MDC.put("traceId", traceIdA);
try {
    logger.info("run task A");
} finally {
    MDC.remove("traceId");
}
```

设置和删除必须成对出现。否则线程被复用时，后续任务的日志可能继续携带旧字段。

### clear

`clear()` 删除当前线程 MDC 中的全部条目：

```java
MDC.clear();
```

它适合当前边界明确拥有整份 MDC 的场景。如果代码只是临时增加一个字段，无条件 `clear()` 可能误删调用者或框架已经设置的其他合法字段。

### getCopyOfContextMap

`getCopyOfContextMap()` 返回当前线程上下文映射的副本：

```java
Map<String, String> capturedA = MDC.getCopyOfContextMap();
```

没有上下文映射时，返回值可能是 `null`。传播代码必须把 `null` 当作“没有上下文”处理，而不是直接传给要求非空映射的代码。

### setContextMap

`setContextMap()` 会先清理当前线程的上下文，再复制传入的映射：

```java
MDC.setContextMap(capturedA);
```

它不是在现有 MDC 上逐项追加。因此，安装任务上下文前需要保存 worker 原来的映射，任务完成后再恢复。

### putCloseable

`putCloseable()` 适合一个键的局部作用域：

```java
try (MDC.MDCCloseable ignoredA = MDC.putCloseable("operationA", "loadA")) {
    logger.info("running");
}
```

关闭返回对象时，SLF4J 会删除这个键。需要注意：如果进入代码块前同一个键已经存在，关闭时不会自动恢复旧值，而是直接删除。

因此，`putCloseable()` 适合确认当前代码拥有该键生命周期的场景。需要支持同名键嵌套覆盖时，应先保存旧值并在 `finally` 中恢复。

## 日志格式如何读取 MDC

以 Logback pattern 为例，可以通过 `%X{key}` 输出 MDC 字段：

```xml
<pattern>%d %-5level [%thread] [%X{traceId}] %logger - %msg%n</pattern>
```

如果当前线程的 MDC 中存在 `traceId`，它会进入日志文本。MDC 只提供字段，日志是否输出、输出在哪里以及如何进入结构化日志，仍由 Appender、Encoder 和采集配置决定。

## 为什么线程池需要显式传播

调用者线程设置 MDC 后提交任务，不代表执行任务的 worker 能读取同一份 MDC：

```text
提交线程：MDC = {traceId=A}
       │
       ├── 提交 Runnable
       ▼
共享 worker：拥有自己的 MDC
```

worker 可能早已存在，也可能在其他上下文中创建。无论底层适配器是否支持子线程继承，都不应把线程创建行为当成任务级传播协议。

正确的传播边界是任务：

```mermaid
flowchart LR
  A[提交时捕获副本] --> B[worker 保存原 MDC]
  B --> C[安装任务 MDC]
  C --> D[执行任务]
  D --> E[finally 恢复原 MDC]
```

## 完整的任务包装模式

下面的示例处理了空上下文、任务异常和 worker 原有上下文：

```java
Runnable wrapA(Runnable taskA) {
    Map<String, String> capturedA = MDC.getCopyOfContextMap();

    return () -> {
        Map<String, String> previousA = MDC.getCopyOfContextMap();
        try {
            installA(capturedA);
            taskA.run();
        } finally {
            installA(previousA);
        }
    };
}

void installA(Map<String, String> contextA) {
    if (contextA == null) {
        MDC.clear();
    } else {
        MDC.setContextMap(contextA);
    }
}
```

捕获发生在提交线程中，安装和恢复发生在 worker 中。`finally` 保证任务抛出异常时仍然恢复现场。

如果只在最后调用 `MDC.clear()`，普通任务可能没有问题，但嵌套任务会破坏外层上下文：

```text
worker 原上下文：outer=A
    └── 内层任务安装 inner=B
            └── 内层任务 clear
                    └── outer=A 也丢失
```

保存并恢复 previous 映射可以保留正确的嵌套语义。

## MDC 与链路追踪不是同一个状态

链路追踪系统通常维护 trace、span 和 scope，并可能把当前 `traceId` 同步进 MDC。两者关系密切，但不是同一个对象：

- 追踪上下文决定当前 span 的父子关系；
- MDC 决定日志中可读取的诊断字段；
- MDC 中存在正确的 `traceId`，不代表追踪 scope 一定正确；
- trace 正确，也不代表用户、租户等业务身份正确。

接入自动插桩或任务装饰器时，应先确认框架已经传播了什么，避免同一字段被多层包装器重复安装和提前清理。

## 不要把 MDC 变成业务数据源

下面的设计把诊断信息变成了业务依赖：

```java
Long idA = Long.valueOf(MDC.get("idA"));
return repositoryA.loadA(idA);
```

这会让查询正确性依赖日志上下文是否成功传播。更合理的方式是显式传入业务标识，MDC 只记录便于排障的关联字段：

```java
ResultA loadA(Long idA, String requestKeyA) {
    String previousA = MDC.get("requestKeyA");
    MDC.put("requestKeyA", requestKeyA);
    try {
        return repositoryA.loadA(idA);
    } finally {
        if (previousA == null) {
            MDC.remove("requestKeyA");
        } else {
            MDC.put("requestKeyA", previousA);
        }
    }
}
```

即使 MDC 丢失，最多影响日志关联，不应改变授权结果或返回数据。

同时，不要把密码、令牌、完整账户信息或其他敏感内容写入 MDC。MDC 字段通常会出现在大量日志中，传播范围和保留时间可能远大于一次请求。

## 回归测试

MDC 传播器至少应覆盖以下场景：

1. 提交线程有 MDC，worker 能读取任务快照；
2. 提交线程没有 MDC，worker 不保留上一个任务的字段；
3. 连续提交上下文 A 和 B，第二个任务只能读取 B；
4. 任务抛出异常后，worker 恢复原上下文；
5. 嵌套任务结束后，外层上下文仍然存在；
6. 捕获后提交线程修改 MDC，不改变已经捕获的任务快照。

使用单 worker 线程池可以稳定验证清理和复用，不需要依赖随机调度。

## 使用清单

- MDC 只存放诊断字段，不承担业务授权。
- 在拥有字段生命周期的边界成对执行 `put()` 和 `remove()`。
- 不确定是否拥有整份上下文时，不要随意 `clear()`。
- 异步提交时使用 `getCopyOfContextMap()` 捕获快照。
- worker 执行前保存旧映射，结束后在 `finally` 中恢复。
- 不假设具体 `MDCAdapter` 会自动完成任务传播。
- 检查追踪框架是否已经提供装饰器，避免重复传播。
- 不向 MDC 写入敏感数据。

## 相关知识

- [共享线程池为什么会放大线程上下文风险](/knowledge/thread-pool-context-propagation/)

## 参考资料

- [SLF4J：MDC API](https://www.slf4j.org/apidocs/org/slf4j/MDC.html)
- [SLF4J：MDC 源码文档](https://www.slf4j.org/api/src-html/org/slf4j/MDC.html)
- [Logback Manual：Mapped Diagnostic Context](https://logback.qos.ch/manual/mdc.html)
