
适合切片的情况
- 动态长度数组/dynamic array
- 需要频繁插入和删除的数组
- 从数组中截取部分内容时




```GO
    // var nums []int  // []int 类型的nil slice，未分配底层数组
    nums := []int{}    // 不是nil，空 slice，底层数组长度为 0
    nums = append(nums, 10)
    nums = append(nums, 20, 30)
    fmt.Println(nums)
```