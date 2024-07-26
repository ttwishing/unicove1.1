<script lang="ts">
	import Login from "./pages/login/login.svelte";
	import Loading from "./pages/loading.svelte";
	import Dashboard from "./pages/dashboard/index.svelte";
	import Send from "./pages/send/index.svelte";

	import { activeSession, appReady, dashboardPage } from "$lib/app/store";
	$: {
		console.log("dashboardPage = ", $dashboardPage);
	}

	$: needLogin = $activeSession === undefined;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<main>
	{#if !$appReady}
		<Loading />
	{:else if needLogin}
		<Login />
	{:else if "/" === $dashboardPage}
		<Dashboard />
	{:else}
		<Send />
	{/if}
</main>

<style>
	main {
		min-height: 100vh;
	}
</style>
