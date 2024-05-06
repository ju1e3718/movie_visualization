(function () {
    const pairCountActors = {};
    const actorAudienceCount = {};
    const connectedNodes = new Set();
    const mainActors = new Set(); // Set to store actors who played leading roles
    let edges = [];

    // Function to parse and prepare data
    function processData() {
        movies.forEach(movie => {
            const audienceCount = parseInt(movie['관객수'].replace(/,/g, ''), 10);
            const mainActorsInMovie = movie.actor_main_name || [];
            const subActorsInMovie = movie.actor_sub_name || [];
            const actors = [...mainActorsInMovie, ...subActorsInMovie].filter(Boolean);

            // Track main actors
            mainActorsInMovie.forEach(actor => mainActors.add(actor));

            actors.forEach(actor => {
                actorAudienceCount[actor] = (actorAudienceCount[actor] || 0) + audienceCount;
            });

            for (let i = 0; i < actors.length; i++) {
                for (let j = i + 1; j < actors.length; j++) {
                    const pairKey = [actors[i], actors[j]].sort().join('-');
                    pairCountActors[pairKey] = (pairCountActors[pairKey] || 0) + 1;
                }
            }
        });
    }

    // Function to create the graph from the data with a specific minCount
    function createGraph(minCount) {
        edges = [];
        connectedNodes.clear();

        Object.entries(pairCountActors).forEach(([pairKey, count]) => {
            if (count >= minCount) {
                const [from, to] = pairKey.split('-');
                edges.push({ from, to, color: '#cccccc' });
                connectedNodes.add(from);
                connectedNodes.add(to);
            }
        });

        const nodes = [];
        connectedNodes.forEach(node => {
            const audienceCountInMillions = (actorAudienceCount[node] / 10000000).toFixed(2);
            const isMainActor = mainActors.has(node);
            nodes.push({
                id: node,
                label: node,
                value: actorAudienceCount[node], // Use value for size scaling
                color: isMainActor ? 'orange' : '#97C2FC', // Differentiate color
                shape: isMainActor ? 'star' : 'dot', // Different shape for main actors
                title: `Audience (천만): ${audienceCountInMillions}` // Tooltip to display audience count in millions
            });
        });

        // Create the network graph with vis.js
        const container = document.getElementById('network');
        const dataSet = {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges)
        };
        const options = {
            nodes: {
                scaling: {
                    min: 10, // Minimum size
                    max: 100 // Maximum size
                },
                font: {
                    size: 18 // Adjust this value to set the font size
                }
            }
        };
        new vis.Network(container, dataSet, options);
    }

    // Prepare the data and create the initial graph
    processData();
    createGraph(4); // Default minCount is 4

    // Slider change event to redraw the graph with the new minCount
    document.getElementById('min-count-slider').addEventListener('input', (event) => {
        const minCount = parseInt(event.target.value, 10);
        document.getElementById('min-count-value').textContent = minCount;
        createGraph(minCount);
    });
})();
