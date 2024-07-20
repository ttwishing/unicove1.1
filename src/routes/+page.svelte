<script lang="ts">
	import Login from "./pages/login.svelte";
	import Loading from "./pages/loading.svelte";
	import Dashboard from "./pages/dashboard/index.svelte";

	console.log("page.svelte===================start");
	import { activeSession, appReady } from "$lib/app/store";

	$: needLogin = $activeSession === undefined;

	import { onMount } from "svelte";

	onMount(() => {});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	{#if !$appReady}
		<Loading />
	{:else if needLogin}
		<Login />
	{:else}
		<Dashboard />
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
