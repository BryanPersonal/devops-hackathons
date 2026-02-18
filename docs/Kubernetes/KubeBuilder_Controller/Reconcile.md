Reconcile 的标准流程（你要记住这个模板）

0. 从 API Server 读取对象
1. 判断对象是否存在
2. 读取关联资源（例如：Shoot）
3. 解析业务字段（例如：expiresAt）
4. 判断对象是否被删除
5. 根据是否被删除，分流到 delete 或 reconcile 逻辑
> 以上代码流程为 Reconcile 标准模板，非常通用。
