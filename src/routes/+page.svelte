<script lang="ts">
	import Login from "./pages/login/login.svelte";
	import Loading from "./pages/loading.svelte";
	import Dashboard from "./pages/dashboard/index.svelte";
	import Send from "./pages/send/index.svelte";
	import Receive from "./pages/receive/index.svelte";
	import Earn from "./pages/earn/index.svelte";
	import Resources from "./pages/resources/index.svelte";

	// import { activeSession, appReady, dashboardPage } from "$lib/app/store";
	import { activeSession } from "$lib/wharfkit/auth";
	import { appReady } from "$lib/wharfkit/main";

	$: needLogin = $activeSession === undefined;
	$: {
		console.log("appReady = ", $appReady);
	}
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
	{:else}
		<Dashboard />
	{/if}
</main>

<style>
	main {
		min-height: 100vh;
	}
</style>
