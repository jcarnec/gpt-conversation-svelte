<!-- This should be done off the node data not the conversation data -->


<script>
    import { selectedNode, reactiveNodes } from "./store.js";
    let lineOfConversation = [];

    $: if ($selectedNode) {
        lineOfConversation = reactiveNodes.getLineOfConversation($selectedNode);
    }

</script>

<div class="chat-node">
    {#each lineOfConversation as node (node.nodeId)}
        <div class="node">
            <div class="prompt">{node.branchNumber}</div>
            <div class="prompt">{node.prompt}</div>
            <div class="answer">{node.answer}</div>
        </div>
    {/each}


        

</div>
