(function () {
    const pairCountCoach = {};
    const edges = [];
    const connectedNodes = new Set();
    const coachSet = new Set(); // To identify coaches
    const audienceCountByPerson = {}; // Store the aggregated audience count for each person

    // Process each movie to establish relationships and calculate audience counts
    movies.forEach(movie => {
        const coachKey = `감독_${movie.coach}`;
        const coachDisplayName = movie.coach;
        const audienceCount = parseInt(movie['관객수'].replace(/,/g, ''), 10);
        const mainActors = movie.actor_main_name || [];
        coachSet.add(coachKey); // Mark this as a coach

        mainActors.forEach(actor => {
            const actorKey = `배우_${actor}`;
            const actorDisplayName = actor;
            const pairKey = `${coachKey}-${actorKey}`;
            pairCountCoach[pairKey] = (pairCountCoach[pairKey] || 0) + 1;

            // Aggregate audience count for each person
            audienceCountByPerson[actorKey] = (audienceCountByPerson[actorKey] || 0) + audienceCount;
        });

        audienceCountByPerson[coachKey] = (audienceCountByPerson[coachKey] || 0) + audienceCount;
    });

    // Create edges for coach-actor pairs that have worked together in at least two movies
    Object.entries(pairCountCoach).forEach(([pairKey, count]) => {
        if (count >= 2) { // Change count threshold as needed
            const [coachKey, actorKey] = pairKey.split('-');
            edges.push({ from: coachKey, to: actorKey, color: '#cccccc' });
            connectedNodes.add(coachKey);
            connectedNodes.add(actorKey);
        }
    });

    // Only add nodes that are connected by at least one edge
    const nodes = [];
    connectedNodes.forEach(nodeKey => {
        const isCoach = coachSet.has(nodeKey);
        const displayName = nodeKey.replace(/^배우_|^감독_/, ''); // Remove the prefix
        const shape = isCoach ? 'dot' : 'star'; // Dot for coaches, Star for actors
        const color = isCoach ? 'skyblue' : 'orange'; // Skyblue for coaches, Orange for actors
        const size = (audienceCountByPerson[nodeKey] / 10000000) || 1; // Size based on audience count, default to 1 if undefined
        const audienceCountInMillions = (audienceCountByPerson[nodeKey] / 10000000).toFixed(2); // Audience count in millions

        nodes.push({
            id: nodeKey,
            label: displayName, // Only show the name
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
        const coachKey = `감독_${personName}`;
        const actorKey = `배우_${personName}`;
        const isPersonConnected = connectedNodes.has(coachKey) || connectedNodes.has(actorKey);
        if (!isPersonConnected) {
            return; // Do nothing if the person isn't found
        }

        resetColors(); // Reset the colors first

        const connectedEdges = [];
        const connectedNodesSet = new Set();

        dataSet.edges.forEach(edge => {
            if (edge.from === coachKey || edge.to === coachKey || edge.from === actorKey || edge.to === actorKey) {
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

        const personKey = connectedNodes.has(coachKey) ? coachKey : actorKey;
        connectedNodesSet.add(personKey);
        const updatedNodes = Array.from(connectedNodesSet).map(node => ({
            id: node,
            label: node.replace(/^배우_|^감독_/, ''), // Only show the name
            color: node === personKey ? 'red' : (coachSet.has(node) ? 'skyblue' : 'orange'), // Red for highlighted, otherwise skyblue or orange
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
