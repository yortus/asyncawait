

# TODO
- Describe benchmark / comparison code - what is being compared and why?
- Factor out common bestCandidate code to improve comparison (in largest.js)



# Results (on mine)

| Method        | SLOC | Max indents | Ops/sec |
| ------------- | ---- | ----------- | ------- |
| async         |   42 |           8 |    ~234 |
| asyncawait    |   20 |           4 |    ~188 |
| callbacks     |   49 |           7 |    ~256 |
| co            |   20 |           4 |    ~188 |
