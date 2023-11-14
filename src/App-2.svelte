<script>
    import { writable, get } from 'svelte/store';
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import NodeComponent from './NodeComponent.svelte';
    // import './index.css'; // Assuming your CSS is compatible with Svelte

    let conv = [
        { resultingNode: "A1", originNode: "A0", originBranchNumber: 1, prompt: "Can you explain PCA?", answer: "PCA is Principle Component Analysis..." },
        { resultingNode: "A2", originNode: "A1", originBranchNumber: 1, prompt: "What is the covariance matrix?", answer: "The covariance matrix is a square matrix..." },
        { resultingNode: "A3", originNode: "A2", originBranchNumber: 1, prompt: "How do you calculate the covariance matrix?", answer: "It is done by comparing how two variables..." },
        { resultingNode: "A4", originNode: "A1", originBranchNumber: 2, prompt: "Can you explain eigen vectors and eigen values?", answer: "Eigen vectors and eigen values are vectors..." },
        { resultingNode: "A5", originNode: "A4", originBranchNumber: 1, prompt: "How do we find the eigen values and eigen vectors?", answer: "We can calculate the eigen vectors and eigen values by solving Av = (lambda)v..." },
        { resultingNode: "A6", originNode: "A2", originBranchNumber: 1, prompt: "Can you give a visual explanation of the covariant matrix", answer: "Here is a visual expiation lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum " }
    ];


    let nodesStore = writable([]);
    let linksStore = writable([]);


    function createGraphData(conversation) {
        const nodes = [];
        const links = [];
        const nodeSet = new Set();

        for (const { resultingNode, originNode, originBranchNumber, prompt, answer } of conversation) {
            // Add node if it's not already in the set
            if (!nodeSet.has(resultingNode)) {
                nodes.push({ id: resultingNode, prompt, answer });
                nodeSet.add(resultingNode);
            }

            // Add link
            if (originNode) {
                links.push({ source: originNode, target: resultingNode });
            }
        }

        // add root node
        nodes.push({ id: 'A0', prompt: 'Root Node', answer: 'Root Node' });


        // assign a level to each node based on how far it is from the root node
        const root = nodes.find(node => node.id === 'A0');
        root.level = 0;
        const stack = [root];
        while (stack.length) {
            const node = stack.pop();
            const children = links.filter(link => link.source === node.id).map(link => nodes.find(node => node.id === link.target));
            for (const child of children) {
                child.level = node.level + 1;
                stack.push(child);
            }
        }

        return { nodes, links };

    }

    let svg; // Reference to the SVG element

    onMount(() => {
        const graphData = createGraphData(conv);
        nodesStore.set(graphData.nodes);
        linksStore.set(graphData.links);
        // Important: Access the store values
        const nodes = get(nodesStore);
        const links = get(linksStore);

        console.log(nodes);

        const width = 800; // Set your desired width
        const height = 600; // Set your desired height

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        const svgElement = d3.select(svg)
            .attr("width", width)
            .attr("height", height);

        const link = svgElement.append("g")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", d => Math.sqrt(d.value));

        const node = svgElement.append("g")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", 5)
            .attr("fill", '#69b3a2')
            .call(drag(simulation));

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            nodesStore.set(nodes);
            linksStore.set(links);
        });

        const unsubscribeNodes = nodesStore.subscribe(value => {
            simulation.nodes(value).restart();
        });

        const unsubscribeLinks = linksStore.subscribe(value => {
            d3.forceLink(value).id(d => d.id);
        });

        simulation.on("tick", () => {
            nodesStore.update(n => n.map(node => ({ ...node, x: node.x, y: node.y })));
            linksStore.update(l => l); // If links need to be updated
        });

        return () => {
            unsubscribeNodes();
            unsubscribeLinks();
        };

        function drag(simulation) {
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

    });

    // Svelte handles events differently. You'll likely use inline event handlers in the markup.
</script>

<svg bind:this={svg} width="100%" height="100%">
    <!-- SVG elements created by D3 -->
    {#each $linksStore as link (link.id)}
        <line x1={link.source.x} y1={link.source.y}
              x2={link.target.x} y2={link.target.y}
              stroke="#999" stroke-opacity="0.6"
              stroke-width="2" />
    {/each}
</svg>
{#each $nodesStore as node (node.id)}
    {console.log(node)}
    <NodeComponent {node} />
{/each}

<style>
    /* Your CSS */
</style>
