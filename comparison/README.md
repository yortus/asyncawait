
# Comparison Code Overview
A function `function largest(dir, options)`, with several semantically equivalent variants using different asynchronous approaches.

1. Find the largest file in the given directory (recursively searching subdirectories if the option is selected)
2. Keep track of how many files/directories have been processed
3. Get a preview of the file contents (first several characters) if the option is selected
4. Return the details about the largest file and the number of files/directories searched
5. Exploit parallelism wherever possible
6. Don't block anywhere!






# TODO
- Describe benchmark / comparison code - what is being compared and why?



# Comparison Summary

| Variant       | SLOC [1] | Indents [2] | Anachrony [3] | Ops/sec [4] |
| ------------- | -------- | ----------- | ------------- | ----------- |
| callbacks     |       74 |           7 |             8 |    ~304     |
| async         |       64 |           7 |             6 |    ~256     |
| co            |       23 |           2 |             - |    ~215 [5] |
| asyncawait    |       23 |           2 |             - |    ~221     |
| synchronous   |       23 |           2 |             - |    ~189 [6] |

###### Footnotes:
[1] body of largest() only
[2] max indents from outermost statements in body
[3] +1 whenever visual order of statements differs from execution order - in body of largest(), excludes control-flow stmts eg return, if, for
[4] on my machine... all v0.10.25 except for [5]
[5] using v0.11.12 --harmony
[6] Benchmark throws stack overflow after a few runs. Also, not really comparable because it's blocking.
