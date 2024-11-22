<script lang="ts">
    export let name: string | undefined | null;
    export let src;
    export let size = 'sm';

    $: sizeClass = size === 'sm' ? 'ux-avatar--sm' :
                   size === 'lg' ? 'ux-avatar--lg' : 'ux-avatar--md';
</script>

<div class="ux-avatar">
    <div class={`ux-avatar__badge ${sizeClass}`}>
        <div class="ux-avatar__border"></div>
        <img src={src} alt="avatar" />
    </div>
    {#if name}
        <div class="ux-avatar__title ux-ml-1">{name}</div>
    {/if}
</div>

<style>
    .ux-avatar--sm {
        width: 40px;
        height: 40px;
    }
    .ux-avatar--md {
        width: 70px;
        height: 70px;
    }
    .ux-avatar--lg {
        width: 120px;
        height: 120px;
    }
</style>