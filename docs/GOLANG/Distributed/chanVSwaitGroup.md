

💡 何时用 chan vs sync.WaitGroup？ 

用 WaitGroup：只关心“是否完成”，不传递数据
用 chan：需要传递结果、控制流程、或实现更复杂的协调逻辑