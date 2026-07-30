---
title: 'GKE Cloud Logging 如何确定日志 Severity'
slug: 'gke-cloud-logging-severity'
excerpt: '整理 GKE 中非结构化日志与结构化 JSON 日志的 severity 判定规则，并说明 textPayload 中的 ERROR 为什么不等于 ERROR 级别。'
publishedAt: '2026-07-30'
tags: ['GKE', 'Cloud Logging', 'severity', 'Structured Logging', 'Kubernetes']
category: '可观测性'
featured: false
draft: false
---

# GKE Cloud Logging 如何确定日志 Severity

GKE 的应用日志通常由工作负载写入 `stdout` 或 `stderr`，再由日志采集链路写入 Cloud Logging。最终日志条目中的 `severity`，取决于日志是否为结构化格式，以及采集链路能够获得哪些元数据。

## 非结构化日志的默认规则

对于没有显式结构化字段的普通文本日志，GKE 文档给出的默认映射是：

```text
stdout  -> INFO
stderr  -> ERROR
```

例如，下面两行文本内容完全可以包含同一个单词：

```text
stdout: ERROR Call XXX failed
stderr: ERROR Call XXX failed
```

但在默认规则下，它们可能得到不同的 Cloud Logging `severity`，因为输出流不同。

这意味着文本中的 `ERROR` 不是可靠的严重性字段：

```text
textPayload: ERROR Call XXX failed
severity:    INFO
```

这里的 `ERROR` 属于 `textPayload` 的内容；`severity` 是日志条目的独立字段。除非采集器明确支持某种文本格式，否则不会因为正文中出现 `ERROR` 就把条目升级为 ERROR。

## 结构化日志的显式字段

应用可以输出包含 `severity` 字段的结构化 JSON：

```json
{ "severity": "ERROR", "message": "Call XXX failed" }
```

日志代理会将可解析的 JSON 文档作为结构化日志处理，`severity` 可以直接用于日志过滤、告警和分析。除 `severity` 外，还可以携带请求 ID、trace ID、服务名和业务字段。

结构化日志需要满足基本格式要求：

- 每条记录应是合法 JSON
- 通常应输出为单行对象，避免被拆成多条记录
- 不要在 JSON 前面添加普通文本时间戳或日志前缀
- 字段名和字段类型应保持稳定

如果应用输出的是：

```text
2026-07-30 ERROR {"severity":"ERROR","message":"Call XXX failed"}
```

整行可能无法作为 JSON 解析，采集器就可能将其作为普通文本处理。此时不能假设其中的 `severity` 字符串会被识别为日志条目的严重性。

## 应用日志与平台日志的边界

Cloud Logging 的 `severity` 是云平台日志条目的字段，不等同于 Java、Logback 或其他框架内部的日志等级对象。一个框架可以在进程内正确记录 ERROR，但如果最终把格式化文本写入 `stdout`，采集器仍可能按 `stdout` 的默认规则得到 INFO。

因此，排查“ERROR 显示为 INFO”时应按以下顺序检查：

1. 应用是否真的产生了这条日志
2. 日志最终写入了 `stdout` 还是 `stderr`
3. 输出是否为合法、单行的结构化 JSON
4. JSON 中是否存在正确的 `severity` 字段
5. Cloud Logging 条目中的 `textPayload`、结构化字段和 `severity` 是否符合预期

可以先用 Kubernetes 侧的日志检查确认应用输出：

```shell
kubectl logs <pod-name> -c <container-name> --timestamps
```

再在 Cloud Logging 中检查采集后的字段。不要只根据控制台上显示的 `ERROR` 前缀判断平台字段已经正确。

## 选择建议

仅需要把普通应用日志采集到平台时，输出到 `stdout` 是最简单的约定。需要区分错误流时，可以让 ERROR 进入 `stderr`。如果日志要参与复杂查询、关联追踪或告警，优先使用结构化 JSON，并显式设置 `severity`。

## 参考

- [GKE: About logs](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/about-logs)
- [GKE: Understanding your logs](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/view-logs)
- [GKE: Troubleshooting logging](https://docs.cloud.google.com/kubernetes-engine/docs/troubleshooting/troubleshooting-gke-logging)
