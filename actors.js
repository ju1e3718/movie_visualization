(function () {
    const pairCountActors = {};
    const edges = [];
    const connectedNodes = new Set();

    movies.forEach(movie => {
        const actors = [
            ...movie.actor_main_name || [],
            ...movie.actor_sub_name || []
        ].filter(Boolean);

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
            edges.push({from, to, color: '#cccccc'});
            connectedNodes.add(from);
            connectedNodes.add(to);
        }
    });

    // Only add nodes that are connected by at least one edge
    const nodes = [];
    connectedNodes.forEach(node => {
        nodes.push({id: node, label: node});
    });

    // Create the network graph with vis.js
    const container = document.getElementById('network');
    const dataSet = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };
    const options = {};
    const network = new vis.Network(container, dataSet, options);

    // Function to reset the colors of all nodes and edges to default
    function resetColors() {
        dataSet.nodes.update(nodes.map(node => ({
            id: node.id,
            label: node.label,
            color: '#97C2FC' // Reset to default color
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
            return { id: node, label: node, color: node === actorName ? 'pink' : 'yellow' };
        });
        dataSet.nodes.update(updatedNodes);
    }

    // Button click event to highlight the actor entered in the search input
    document.getElementById('search-button').addEventListener('click', function() {
        const actorName = document.getElementById('search-input').value.trim();
        if (actorName) {
            highlightActor(actorName);
        }
    });
})();
