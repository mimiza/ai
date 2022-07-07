NEAT ALGO

-   Until all the outputs are active
    -   for all non-sensor nodes
        -   activate node
        -   sum the input
    -   for all non-sensor and active nodes
        -   calculate the output
-   These need to be fixed:
    -   Network.mutate()
    -   Ecosystem.speciate()
    -   Ecosystem.generate()
-   Why NEAT XOR best fit is always 6.25?

TODOS:

-   mutate(): add random layers between input and output layers.
-   crossover(): check layer index, copy layers in between input and output layers.
-   generate(): improve size of each species calculation.
-   connect(): start with zero connection.
-   Implement neural network topology visualization.
