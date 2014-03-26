

# TODO
- Describe benchmark / comparison code - what is being compared and why?
- Factor out common bestCandidate code to improve comparison (in largest.js)



# Comparison Summary

| Variant       | SLOC [1] | Indents [2] | Anachrony [3] | Ops/sec [4] |
| ------------- | -------- | ----------- | ------------- | ----------- |
| callbacks     |          |             |               |        ~304 |
| async         |          |             |               |        ~256 |
| co            |          |             |               |        ~215 |
| asyncawait    |          |             |               |        ~221 |
| synchronous   |          |             |               |    ~189 [5] |

###### Footnotes:
[1]
[2]
[3]
[4] on my machine... v0.10.25  /  v0.11.12 --harmony
[5] Benchmark throws stack overflow after a few runs. Also, not really comparable because it's blocking.
