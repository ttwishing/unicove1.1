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

	$: needLogin = $activeSession === undefined;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<main>
	{#if needLogin}
		<Login />
		<!-- {:else if "/send" === $dashboardPage}
		<Send />
	{:else if "/receive" === $dashboardPage}
		<Receive />
	{:else if "/earn" === $dashboardPage}
		<Earn />
	{:else if "/resources" === $dashboardPage}
		<Resources /> -->
	{:else}
		<Dashboard />
	{/if}
</main>

<style>
	main {
		min-height: 100vh;
	}
</style>
