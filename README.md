# DS_OSNModel
Decentralized Scoring for Online Social Network Model

## QuickStart
Run

    $ git clone https://github.com/RenardFestif/DS_OSNModel.git
    $ cd DS_OSNModel
    $ ./runAll.sh
    
Located in the root folder. It fires up asynchronously the six different script located in the `/src/script/` folder starting
with Witness evaluation following with Scored one.

This results in creating results `.json` files under the `/results/` folder containing. those JSON formatted data are used to build up the plots.
`runAll.sh` also take care to build the plot by calling on the Python script `index.py`

## Manual Start
All scripts located under the `/src/script` folder are callable as standalone. This results into building the corresponding JSON formatted result file
To build and save the evaluation plot one must start the Python script as follow

    $ cd src/plotting/
    $ python3 index.py

The images are stored in `results/` folder 

## Simulation configuration
The simulation is configurable through the `.env` file provided in the root folder. From there the values can be adjusted and different network configuration
can be tested
