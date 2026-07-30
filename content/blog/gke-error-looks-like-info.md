---
title: '那条 ERROR，怎么看都是 INFO：一次 GKE 日志级别错位的排障实录'
slug: 'gke-error-looks-like-info'
excerpt: '一次 GKE dev 环境验收中的日志排障，从一条看似失真的 ERROR 开始，追到 Logback、标准输出流与 Cloud Logging 的边界。'
publishedAt: '2026-07-30'
tags: ['GKE', 'Cloud Logging', 'Kubernetes', 'Logback', '可观测性']
category: '服务工程'
featured: true
draft: false
---

# 那条 ERROR，怎么看都是 INFO：一次 GKE 日志级别错位的排障实录

拿到这个运行多年的老项目时，迁移工作才刚刚开始。

先是一轮改造：补容器配置，调整部署清单，接入 GKE 的服务与监控，然后把应用第一次部署到 dev 环境。Pod 正常启动，探针按时变绿，请求也能稳定返回。

功能请求刚验证完，我顺手打开 Cloud Logging，想确认这次迁移最基础的一件事：日志是否也正常。

我打开日志页面，准备确认最后一项：日志是否也一切如常。

然后，我看到了它。

代码里明明是：

```java
logger.error("Call XXX failed");
```

Cloud Logging 左侧却把它标成了：

```text
Severity
INFO
```

展开日志详情，画面更加刺眼：

```text
textPayload  Call XXX failed
severity     INFO
```

一条在代码里盖着 `ERROR` 印章的日志，到了 Cloud Logging，竟然成了 `INFO`。

第一反应很朴素：

> Cloud Logging 坏了？

当然不太可能。真正值得怀疑的，通常是那个“看起来没有任何问题”的中间环节。

于是，排查开始了。

## 先查最熟悉的：是不是 Logback 配错了

我先把怀疑范围收回应用内部，重新检查老项目的日志配置：

- `logback.xml`
- Spring Boot Logging
- `ConsoleAppender`
- `PatternLayout`
- Logger 与 Root Level

配置里有熟悉的：

```xml
<root level="INFO">
```

业务代码也没有偷偷改过等级：

```java
logger.error("Call XXX failed");
```

我在本地直接运行服务。控制台打印的是：

```text
ERROR ... Call XXX failed
```

没有错。至少在应用这一端，Logback 知道这是一条 ERROR。

这条线索很重要：问题并没有发生在“日志有没有被打出来”，而是发生在日志离开应用之后。

链路于是被拆成了三段：

```text
Console
  ↓
Container Runtime
  ↓
Cloud Logging
```

## 第二个怀疑对象：是不是 GKE 改了日志级别

接下来我开始翻 Kubernetes Logging、GKE Logging 和 Cloud Logging 的文档。

文档里反复出现一个词：**structured logging**。

这让我开始怀疑，是不是 Pattern 不符合采集器的识别规则。于是我轮流试了几种看起来“更像日志级别”的格式：

```text
ERROR xxx
[ERROR] xxx
ERROR: xxx
```

结果没有变化。

Cloud Logging 依然安静地写着：

```text
severity: INFO
```

事情开始变得不再像一个格式问题。因为无论我把 `ERROR` 放在行首、括号里，还是加上冒号，它始终只是日志正文里的几个字符。

## 真正的线索：为什么所有日志都去了 stdout

转机出现在一次很普通的 Pod 检查里。

我执行了：

```bash
kubectl logs <pod-name>
```

输出里混着三种日志：

```text
logger.info(...)
logger.warn(...)
logger.error(...)
```

但它们有一个共同点：全都来自同一条流。

```text
stdout
```

我盯着这个细节看了一会儿。

如果这真是一条 ERROR，它为什么没有出现在 `stderr`？

这就是整件事第一次出现裂缝的地方。之前我一直在检查“日志文本长什么样”，却没有检查“日志究竟从哪条输出流离开进程”。

## 顿悟：严重性不一定写在文本里

继续对照 GKE 与 Cloud Logging 的官方说明，答案终于清楚了。

对于没有显式结构化字段的普通文本日志，采集链路会根据容器的输出流推断严重性。常见的默认路径是：

```text
stdout  →  INFO
stderr  →  ERROR
```

这不是说 Cloud Logging 能从任意一句文本中读懂业务语义。`ERROR`、`WARN`、`INFO` 出现在 `textPayload` 里，首先仍然只是字符串。真正能被明确识别的，是日志进入采集链路时携带的流信息，或者结构化日志中的 `severity` 字段。

于是，所有现象在这一刻同时对上了：

- Logback 在应用内部正确判断了日志等级；
- `ConsoleAppender` 却把它写进了 `System.out`；
- 容器运行时把它作为 `stdout` 收集；
- Cloud Logging 按未结构化日志的默认规则，把它标成了 `INFO`。

那条日志没有在途中“变坏”。它只是从一开始就没有以错误输出流的身份离开应用。

## 原来，Logback 从未告诉系统“这是 ERROR”

老项目一直使用一个很常见的 `ConsoleAppender`。它负责把日志写到控制台，但“控制台”并不是一个抽象的、没有方向的地方。

对 JVM 来说，至少有两条不同的标准输出流：

```text
System.out
System.err
```

如果 Appender 的目标是 `System.out`，那么下面三条日志最终都会进入 `stdout`：

```java
logger.info("...");
logger.warn("...");
logger.error("...");
```

Logback 内部的等级信息当然还在，但它没有自动把 `ERROR` 变成 `System.err`。`logger.error()` 表示的是一条带有 ERROR 等级的日志记录，不是“请把这行字写到错误流”的系统调用。

对本地终端来说，这个区别常常不明显；对 Docker、Kubernetes 和 Cloud Logging 来说，它却可能决定最终的 `severity`。

## 修复：让 ERROR 真正进入 stderr

### 方案一：拆分 stdout 与 stderr

这是对现有 Logback 配置改动最小、也最容易验证的方案。把非 ERROR 日志留在 `stdout`，把 ERROR 日志单独送到 `stderr`：

```xml
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <target>System.out</target>
    <filter class="ch.qos.logback.classic.filter.LevelFilter">
        <level>ERROR</level>
        <onMatch>DENY</onMatch>
        <onMismatch>ACCEPT</onMismatch>
    </filter>
    <encoder>
        <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%thread] %logger - %msg%n</pattern>
    </encoder>
</appender>

<appender name="STDERR" class="ch.qos.logback.core.ConsoleAppender">
    <target>System.err</target>
    <filter class="ch.qos.logback.classic.filter.LevelFilter">
        <level>ERROR</level>
        <onMatch>ACCEPT</onMatch>
        <onMismatch>DENY</onMismatch>
    </filter>
    <encoder>
        <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%thread] %logger - %msg%n</pattern>
    </encoder>
</appender>

<root level="INFO">
    <appender-ref ref="STDOUT" />
    <appender-ref ref="STDERR" />
</root>
```

修改后不要只看应用控制台里的颜色或前缀。应该同时验证三件事：

```bash
kubectl logs <pod-name> -c <container-name> --timestamps
```

确认 ERROR 确实进入 `stderr`，再回到 Cloud Logging 检查 `severity`。如果只验证第一步，很容易把“日志文本看起来正确”误认为“采集后的字段也正确”。

### 方案二：输出结构化 JSON

如果日志平台、查询条件和告警都依赖等级，结构化日志通常更稳妥。让应用直接输出包含明确字段的 JSON：

```json
{
  "severity": "ERROR",
  "message": "Call XXX failed"
}
```

这样，日志等级不再依赖某个采集器对输出流的默认推断，也更容易附带请求 ID、服务名、trace ID 和错误上下文。需要注意的是，结构化 JSON 必须保持为合法、可解析的单行对象；一旦被普通文本前缀包住，采集器就可能只能把整行当作 `textPayload`。

### 方案三：使用 Google 官方 Logging SDK

如果应用直接使用 Google Cloud Logging 客户端库，可以在写入 LogEntry 时显式指定：

```text
Severity.ERROR
```

这条路径由 SDK 构造结构化日志条目，适合需要精确控制资源、标签、trace 和 severity 的场景。代价是应用会与云厂商的日志 API 产生更直接的耦合。

## stdout 和 stderr，从来都不是一回事

很多 Java 开发者平时很少认真区分：

```text
System.out
System.err
```

在本地 IDE 里，它们经常被合并到同一个控制台窗口；在容器里，它们却是两条独立的日志流。Docker 负责捕获它们，Kubernetes 负责暴露它们，Cloud Logging 再根据流或结构化字段建立自己的日志条目。

所以真正完整的链路应该是：

```text
logger.error()
    ↓
Logback 记录等级
    ↓
System.err 输出错误流
    ↓
Container Runtime 捕获 stderr
    ↓
Cloud Logging 推断或读取 severity
    ↓
ERROR
```

中间任何一步走偏，最后都可能只剩下一个看似无辜的 `INFO`。

这次排障给我的教训并不是“记住一条 GKE 配置”，而是重新认识了日志等级：它不是写在日志正文里的装饰词，而是需要沿着整条链路被保留下来的语义。

当你下一次在 Cloud Logging 里看到：

```text
textPayload: Call XXX failed
severity: INFO
```

先别急着责怪 Cloud Logging。回到 Pod，问一个更基础、也更容易被忽略的问题：

> 这条日志，究竟是从 stdout 出来的，还是从 stderr 出来的？

有时候，答案就藏在那条看似普通的输出流里。
