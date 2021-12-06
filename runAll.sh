#! /bin/bash

cd ./src/scripts

start=$(date)
### Run Witness Evalutation
ts-node Witness.ts &
ts-node NWitness.ts & 
ts-node CasesComparison.ts &

### Run Scored Evaluation
ts-node ScoredUserAndContent.ts &
ts-node NScoredUserAndContent.ts &
ts-node ScoredCasesComparison.ts &

wait

python ../plotting/index.py

end=$(date-$start + "%T")
echo "Finished in $end"

