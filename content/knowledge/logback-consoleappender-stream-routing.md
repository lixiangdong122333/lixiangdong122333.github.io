---
title: 'Logback ConsoleAppender：按级别分流 stdout 与 stderr'
slug: 'logback-consoleappender-stream-routing'
excerpt: '说明 Logback ConsoleAppender 的输出目标、LevelFilter 与 ThresholdFilter 的差异，并给出按级别分流的配置模式。'
publishedAt: '2026-07-30'
tags: ['Logback', 'Java', 'ConsoleAppender', 'LevelFilter', '日志']
category: 'Java 工程'
featured: false
draft: false
---

# Logback ConsoleAppender：按级别分流 stdout 与 stderr

Logback 的日志事件包含级别，但级别不会自动决定输出流。`ConsoleAppender` 负责写入控制台，输出目标可以是 `System.out` 或 `System.err`；过滤器负责决定哪些日志事件允许通过 Appender。

## ConsoleAppender 的输出目标

`ConsoleAppender` 的 `target` 属性支持两个标准目标：

```xml
<target>System.out</target>
<target>System.err</target>
```

如果不显式配置目标，默认目标是 `System.out`。因此，单个默认的 ConsoleAppender 可能会把 INFO、WARN 和 ERROR 全部写入 `stdout`。

```xml
<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>%d %-5level %logger - %msg%n</pattern>
    </encoder>
</appender>
```

这段配置并没有表达“ERROR 写入 stderr”的含义。要表达输出流策略，必须显式配置 `target`，并结合过滤器。

## LevelFilter 与 ThresholdFilter

`LevelFilter` 匹配一个精确级别。例如，下面的过滤器只接受 INFO，拒绝其他级别：

```xml
<filter class="ch.qos.logback.classic.filter.LevelFilter">
    <level>INFO</level>
    <onMatch>ACCEPT</onMatch>
    <onMismatch>DENY</onMismatch>
</filter>
```

`ThresholdFilter` 表示最低级别阈值。低于阈值的事件被拒绝，达到或高于阈值的事件继续处理：

```xml
<filter class="ch.qos.logback.classic.filter.ThresholdFilter">
    <level>INFO</level>
</filter>
```

二者不能随意互换。若要把 ERROR 从 stdout 排除，并把 ERROR 单独发送到 stderr，精确分流通常应使用 `LevelFilter`。仅在两个 Appender 上分别配置 `ThresholdFilter`，可能导致同一条 ERROR 被两个 Appender 同时输出。

## 按级别分流的配置

下面的配置将 ERROR 写入 `System.err`，将其他通过 root 级别的日志写入 `System.out`：

```xml
<configuration>
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
</configuration>
```

`root level="INFO"` 会先决定哪些事件进入 root；两个 Appender 的过滤器再决定每个事件写入哪条流。在标准 Logback 级别中，ERROR 是最高级别，因此这个示例可以将 ERROR 独占到 stderr。

## 配置时的注意事项

- 如果业务 Logger 还配置了自己的 Appender，检查 `additivity`，避免事件沿父 Logger 链路重复输出
- 同一条日志被多个 Appender 接收时，Cloud Logging 可能收到重复记录
- 修改配置后，同时检查应用本地输出、容器日志和 Cloud Logging 条目
- 不要把日志文本中的 `[ERROR]` 当作输出流配置的替代品

验证容器侧输出可以使用：

```shell
kubectl logs <pod-name> -c <container-name> --timestamps
```

最终是否显示为 ERROR，还取决于平台对 stdout、stderr 或结构化字段的处理规则；Logback 配置正确并不等同于 Cloud Logging 条目已经正确。

## 参考

- [Logback: ConsoleAppender](https://logback.qos.ch/manual/appenders.html)
- [Logback: Filters](https://logback.qos.ch/manual/filters.html)
