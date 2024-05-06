(function () {
    const pairCountCoach = {};
    const edges = [];
    const connectedNodes = new Set();
    const coachSet = new Set(); // To identify coaches
    const audienceCountByPerson = {}; // Store the aggregated audience count for each person

    // Process each movie to establish relationships and calculate audience counts
    movies.forEach(movie => {
        const coach = movie.coach;
        const audienceCount = parseInt(movie['관객수'].replace(/,/g, ''), 10);
        const mainActors = movie.actor_main_name || [];
        coachSet.add(coach); // Mark this as a coach

        mainActors.forEach(actor => {
            const pairKey = `${coach}-${actor}`;
            pairCountCoach[pairKey] = (pairCountCoach[pairKey] || 0) + 1;

            // Aggregate audience count for each person
            audienceCountByPerson[actor] = (audienceCountByPerson[actor] || 0) + audienceCount;
        });

        audienceCountByPerson[coach] = (audienceCountByPerson[coach] || 0) + audienceCount;
    });

    // Create edges for coach-actor pairs that have worked together in at least two movies
    Object.entries(pairCountCoach).forEach(([pairKey, count]) => {
        if (count >= 2) { // Change count threshold as needed
            const [coach, actor] = pairKey.split('-');
            edges.push({ from: coach, to: actor, color: '#cccccc' });
            connectedNodes.add(coach);
            connectedNodes.add(actor);
        }
    });

    // Only add nodes that are connected by at least one edge
    const nodes = [];
    connectedNodes.forEach(node => {
        const isCoach = coachSet.has(node);
        const shape = isCoach ? 'dot' : 'star'; // Dot for coaches, Star for actors
        const color = isCoach ? 'skyblue' : 'orange'; // Skyblue for coaches, Orange for actors
        const size = (audienceCountByPerson[node] / 10000000) || 1; // Size based on audience count, default to 1 if undefined
        const audienceCountInMillions = (audienceCountByPerson[node] / 10000000).toFixed(2); // Audience count in millions

        nodes.push({
            id: node,
            label: node,
            color: color,
            shape: shape,
            value: size,
            font: { size: 30 }, // Font size of 30
            title: `Audience (천만): ${audienceCountInMillions}`
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
                size: 30 // Adjust this value to set the font size
            }
        }
    };
    const network = new vis.Network(container, dataSet, options);

    // Function to reset the colors of all nodes and edges to default
    function resetColors() {
        dataSet.nodes.update(nodes.map(node => ({
            id: node.id,
            label: node.label,
            color: coachSet.has(node.id) ? 'skyblue' : 'orange', // Skyblue for coaches, Orange for actors
            shape: coachSet.has(node.id) ? 'dot' : 'star', // Dot for coaches, Star for actors
            font: { size: 30 } // Ensure font size is maintained
        })));

        dataSet.edges.update(edges.map(edge => ({
            id: edge.id,
            from: edge.from,
            to: edge.to,
            color: '#97C2FC'
        })));
    }

    // Function to highlight a specific coach or actor and their connected nodes and edges
    function highlightPerson(personName) {
        // Only proceed if the person exists in the connected nodes
        if (!connectedNodes.has(personName)) {
            return; // Do nothing if the person isn't found
        }

        resetColors(); // Reset the colors first

        const connectedEdges = [];
        const connectedNodesSet = new Set([personName]);

        dataSet.edges.forEach(edge => {
            if (edge.from === personName || edge.to === personName) {
                connectedEdges.push({
                    id: edge.id,
                    from: edge.from,
                    to: edge.to,
                    color: { color: 'red' }
                });
                connectedNodesSet.add(edge.from);
                connectedNodesSet.add(edge.to);
            }
        });

        dataSet.edges.update(connectedEdges);

        const updatedNodes = Array.from(connectedNodesSet).map(node => ({
            id: node,
            label: node,
            color: node === personName ? 'red' : (coachSet.has(node) ? 'skyblue' : 'orange'), // Red for highlighted, otherwise skyblue or orange
            shape: coachSet.has(node) ? 'dot' : 'star', // Dot for coaches, Star for actors
            font: { size: 30 }, // Ensure font size is maintained
            value: (audienceCountByPerson[node] / 10000000) || 1 // Retain node size based on audience count
        }));
        dataSet.nodes.update(updatedNodes);
    }

    // Button click event to highlight the person (coach or actor) entered in the search input
    document.getElementById('search-button').addEventListener('click', function () {
        const personName = document.getElementById('search-input').value.trim();
        if (personName) {
            highlightPerson(personName);
        }
    });
})();
