---
title: 'Kubernetes 服务排障速查'
slug: 'kubernetes-troubleshooting'
excerpt: '按影响、工作负载、事件、日志与依赖的顺序缩小 Kubernetes 故障范围。'
publishedAt: '2026-07-16'
tags: ['Kubernetes', '排障', 'SRE', '运行手册']
category: '云原生'
featured: false
draft: false
---

# Kubernetes 服务排障速查

排障的目标是快速缩小问题范围，同时保留证据。先确认用户影响与时间窗口，再进入具体 Pod，避免被单条异常日志带偏。

## 第一轮检查

- [ ] 确认环境、命名空间、服务名与影响开始时间
- [ ] 检查 Deployment 的期望副本与可用副本
- [ ] 查看 Pod 状态、重启次数和节点分布
- [ ] 按时间排序读取 Warning 事件
- [ ] 使用请求 ID 或 trace ID 关联应用日志
- [ ] 检查上游流量与下游依赖是否同时异常

```shell
kubectl -n sweetwater get deploy,pod -l app=sweetwater-payments-service -o wide
kubectl -n sweetwater describe deploy sweetwater-payments-service
kubectl -n sweetwater get events --sort-by=.metadata.creationTimestamp
kubectl -n sweetwater logs deploy/sweetwater-payments-service --since=20m --all-containers --prefix
```

## 常见状态如何继续

| 现象                | 优先检查                 | 下一步证据                   |
| ------------------- | ------------------------ | ---------------------------- |
| `Pending`           | 资源请求、调度约束、PVC  | Pod 事件与调度器消息         |
| `CrashLoopBackOff`  | 启动参数、配置、依赖     | 当前日志与 `--previous` 日志 |
| `ImagePullBackOff`  | 镜像名、标签、凭据       | Pod 事件与仓库权限           |
| 就绪探针失败        | 探针路径、端口、启动耗时 | 容器日志与探针响应           |
| 延迟升高但 Pod 正常 | 数据库、网络、限流       | 指标、追踪与依赖日志         |

需要修改配置或重启工作负载前，先记录当前副本、镜像摘要、事件和关键指标。恢复服务后仍要补齐时间线、根因与防复发动作，而不是把“重启后正常”当作结论。
