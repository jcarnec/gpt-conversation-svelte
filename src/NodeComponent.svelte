<script>
    export let node;
    export let handleMouseDown;
    export let svgTransform;
</script>

<div  class="node" style="left: {node.x + svgTransform.x}px; top: {node.y + svgTransform.y}px;" 
    on:mousedown={(event) => handleMouseDown(event, node)}
    role="button"
    tabindex="0"
    >
    <div class="prompt">{node.branchNumber}</div>
    <div class="prompt">{node.prompt}</div>
    <div class="answer">{node.answer}</div>
</div>




<style>
    .node {
        position: absolute;
        border: 1px solid black;
        background-color: white;
        text-align: center;
        transform-origin: top left;
        width: 200px;
        max-height: 200px;
        /* -- overflowing text should be hidden -- */
        overflow: hidden;
    }

    .node:hover {
        cursor: pointer;
        border: 1px solid blue;
    }
    /* ... other styles ... */
</style>

