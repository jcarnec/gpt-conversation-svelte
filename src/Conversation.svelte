<!-- This should be done off the node data not the conversation data -->


<script>
    import { selectedNode } from "./store.js";
    export let conversation;
    let lineOfConversation = [];

    // Reactive statement to update lineOfConversation whenever selectedNode changes
    // $: lineOfConversation = getLineOfConversation($selectedNode);
    $: if ($selectedNode) {
        lineOfConversation = getLineOfConversation($selectedNode);
    }

    function getLineOfConversation(currentNode) {
        let line = [];
        let c = $conversation.find((n) => n.nodeId === currentNode.id);
        while (c) {
            line.push(c);
            c = getParent($conversation, c);
        }
        return line;
    }

    function getParent(conversation, c) {
        return conversation.find(n => n.nodeId === c.originNodeId && c.originNodeId !== c.nodeId);
        
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
