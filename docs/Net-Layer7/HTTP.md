
没有足够夯实的底层基础 
上层结构或代码应用也只是浮于水面


1. Http 请求中什么时候需要向客户端发送响应数据
    - 数据查询类请求（如 GET） 客户端请求资源，服务器必须返回对应的数据. 示例：获取用户信息 `GET /user/123`  --> 响应 JSON 数据：`{"id":123,"name":"Alice"}`
    - 创建资源（如 POST）虽然客户端发送数据，但服务器应返回结果说明是否创建成功，可能还要返回新资源的 ID 或详细信息。 示例：创建订单  --> 响应：201 Created + 订单信息
    - 更新资源（如 PUT/PATCH）客户端希望修改资源，服务器通常返回更新后的资源或操作状态。 示例：更新用户邮箱 `PATCH /user/123/email` --> 响应：200 OK + 新的用户信息
    - 删除资源（如 DELETE）

| 请求类型      | 是否应返回响应数据 | 说明                     |
| --------- | --------- | ---------------------- |
| GET       | ✅ 是       | 返回请求的数据内容              |
| POST      | ✅ 是       | 返回创建结果或新资源信息           |
| PUT/PATCH | ✅ 是       | 返回更新后的资源或状态            |
| DELETE    | ✅/❌ 视情况而定 | 通常返回状态，可能无响应体          |
| OPTIONS   | ✅ 是       | 返回支持的方法等信息             |
| HEAD      | ❌ 不返回正文   | 只返回响应头                 |
| 其他        | ✅ 是       | 如 WebSocket 升级、文件上传响应等 |
