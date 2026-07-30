---
title: 'stdout 与 stderr：从进程输出流到容器日志'
slug: 'stdout-stderr-container-logging'
excerpt: '说明 stdout 与 stderr 的职责边界，以及容器运行时、Kubernetes 和日志采集器如何处理这两条输出流。'
publishedAt: '2026-07-30'
tags: ['stdout', 'stderr', 'JVM', 'Docker', 'Kubernetes', '日志']
category: '云原生'
featured: false
draft: false
---

# stdout 与 stderr：从进程输出流到容器日志

`stdout` 和 `stderr` 是进程的两条标准输出流。它们首先是 I/O 通道，不是编程语言或日志框架定义的日志级别。

在 Java 中，常见对应关系是：

```text
System.out  -> stdout
System.err  -> stderr
```

`logger.error()` 是否写入 `stderr`，取决于日志框架的 Appender 配置；它不会因为方法名包含 `error` 就自动切换输出流。

## 进程层

进程可以分别向两条流写入内容：

```java
System.out.println("normal output");
System.err.println("diagnostic output");
```

终端通常会把两条流显示在同一个窗口中，因此差异不一定明显。Shell 可以分别重定向它们：

```shell
java -jar app.jar > app.out 2> app.err
```

也可以将标准错误合并到标准输出：

```shell
java -jar app.jar > app.log 2>&1
```

一旦合并，后续系统就无法仅凭输出流区分两类内容。因此，是否保留两条流的边界应在日志采集设计中明确决定。

## 容器层

容器运行时负责捕获容器进程写入的 `stdout` 和 `stderr`。写入容器内部普通文件的日志不会自动成为容器日志；必须额外部署文件采集器或改变应用输出方式。

容器日志的基本链路可以表示为：

```text
应用进程
  ↓
stdout / stderr
  ↓
容器运行时
  ↓
节点上的容器日志
```

容器运行时会为日志记录附加时间和流等元数据。具体文件格式由运行时和节点配置决定，应用不应依赖节点上的日志文件路径作为接口。

## Kubernetes 层

Kubernetes 通过 kubelet 和容器运行时管理容器日志，并通过 Pod 日志 API 提供访问。最常用的命令是：

```shell
kubectl logs <pod-name> -c <container-name>
kubectl logs <pod-name> -c <container-name> --previous
```

`kubectl logs` 默认返回容器日志的可读内容；在多容器 Pod 中必须用 `-c` 指定容器，`--previous` 用于查看上一次已终止容器实例的日志。

标准输出和标准错误在 Kubernetes 日志架构中仍然是两个不同的流，但客户端默认查看的是合并后的日志内容。不要仅凭终端中的文本顺序判断一行日志来自哪条流。需要确认流归属时，应使用采集系统提供的 stream 字段，或使用运行时、节点和日志代理的诊断能力。

## 对应用日志的设计要求

在容器环境中，应用至少应满足以下条件：

- 将需要被平台采集的日志写到 `stdout` 或 `stderr`
- 不依赖容器内普通文件作为唯一日志出口
- 明确约定不同输出流的用途
- 对需要稳定查询的字段使用结构化日志，而不是依赖文本前缀

需要特别区分两个概念：

```text
日志等级：INFO / WARNING / ERROR
输出流：  stdout / stderr
```

二者可以建立约定，但并不是同一个维度。日志框架可以把 ERROR 路由到 `stderr`，也可以把所有级别都写到 `stdout`；最终行为由配置决定。

## 参考

- [Kubernetes Logging Architecture](https://kubernetes.io/docs/concepts/cluster-administration/logging/)
- [GKE: Understanding your logs](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/view-logs)
