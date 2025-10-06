

smallest code snippets for channel
```
type Worker struct {
	jobs chan int
}

func main() {
	// create struct instance and initilize struct
	w := Worker{
		jobs: make(chan int, 1),
	}

	// send data to channel
	w.jobs <- 42

	// receive data from chan
	value := <-w.jobs
	fmt.Println("Received", value)
}
```

Minimum granularity `Chan` + `Go`

```
func square(x int, ch chan int) {
	result := x * x
	ch <- result // passing result to channel
}

func main() {
	// create a channel to receive result
	ch := make(chan int)

	// start two goroutine to calculate concurrently
	go square(3, ch)
	go square(4, ch)

	// receive two results from channel
	a := <-ch
	b := <-ch

	fmt.Println("3*3 =", a)
	fmt.Println("4*4 =", b)
	fmt.Println("Sum =", a+b)
}

```