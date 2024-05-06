(function () {
    const pairCountActors = {};
    const actorAudienceCount = {};
    const edges = [];
    const connectedNodes = new Set();
    const mainActors = new Set(); // Set to store actors who played leading roles

    // Calculate audience count per actor and identify main actors
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

    // Create edges for actor pairs that have worked together in at least four movies
    Object.entries(pairCountActors).forEach(([pairKey, count]) => {
        if (count >= 4) {
            const [from, to] = pairKey.split('-');
            edges.push({ from, to, color: '#cccccc' });
            connectedNodes.add(from);
            connectedNodes.add(to);
        }
    });

    // Only add nodes that are connected by at least one edge
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
    const network = new vis.Network(container, dataSet, options);

    // Function to reset the colors of all nodes and edges to default
    function resetColors() {
        dataSet.nodes.update(nodes.map(node => ({
            id: node.id,
            label: node.label,
            value: node.value, // Retain size
            color: node.shape === 'star' ? 'orange' : '#97C2FC', // Apply shape-specific color
            shape: node.shape, // Retain shape
            font: { size: 18 } // Ensure font size is maintained
        })));

        dataSet.edges.update(edges.map(edge => ({
            id: edge.id,
            from: edge.from,
            to: edge.to,
            color: '#97C2FC' // Reset to default color
        })));
    }

    // Function to highlight a specific actor and their connected nodes and edges
    function highlightActor(actorName) {
        if (!connectedNodes.has(actorName)) {
            // If the actor name doesn't exist, do nothing
            return;
        }

        // Reset the colors first
        resetColors();

        const connectedEdges = [];
        const connectedNodesSet = new Set([actorName]);

        dataSet.edges.forEach(edge => {
            if (edge.from === actorName || edge.to === actorName) {
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

        const updatedNodes = Array.from(connectedNodesSet).map(node => {
            const audienceCountInMillions = (actorAudienceCount[node] / 10000000).toFixed(2);
            return {
                id: node,
                label: node,
                color: node === actorName ? 'red' : (mainActors.has(node) ? 'pink' : 'pink'),
                shape: mainActors.has(node) ? 'star' : 'dot', // Different shape for main actors
                value: actorAudienceCount[node], // Maintain size based on audience count
                font: { size: 18 }, // Ensure font size is maintained
                title: `Audience (천만): ${audienceCountInMillions}` // Tooltip to display audience count in millions
            };
        });
        dataSet.nodes.update(updatedNodes);
    }

    // Button click event to highlight the actor entered in the search input
    document.getElementById('search-button').addEventListener('click', function () {
        const actorName = document.getElementById('search-input').value.trim();
        if (actorName) {
            highlightActor(actorName);
        }
    });
})();
