<script>
	import { onMount } from 'svelte';
	import { CopyIcon } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';

	export let showNotification;

	const fontConfigs = [
		{
			id: 'hafs-new',
			name: 'مصحف حفص',
			prefix: 'QCF2',
			url: 'https://muqri.com/mushaf/woff2/',
			maxPage: 605
		},
		{
			id: 'hafs-old',
			name: 'مصحف حفص القديم',
			prefix: 'QCF_P',
			url: 'https://raw.githubusercontent.com/alquran-foundation/qpc-fonts/master/mushaf-woff2/',
			maxPage: 604
		}
	];

	let fontPage = 1;
	let currentFont = 'hafs-new';
	let text = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ';
	let loadedFonts = new Set();

	let fontError = false;
	let fontLoading = false;

	$: fontConfig = fontConfigs.find((f) => f.id === currentFont) || fontConfigs[0];
	$: formattedPage = String(fontPage).padStart(3, '0');
	$: fontFamily = `${fontConfig.prefix}${formattedPage}`;

	async function loadFont() {
		if (loadedFonts.has(fontFamily)) return;

		fontLoading = true;
		fontError = false;

		try {
			if (typeof window === 'undefined') return;
			const fontUrl = `${fontConfig.url}${fontConfig.prefix}${formattedPage}.woff2`;
			const font = new FontFace(fontFamily, `url(${fontUrl})`);
			await font.load();
			document.fonts.add(font);
			loadedFonts.add(fontFamily);
			showNotification('تم تحميل الخط');
		} catch (error) {
			console.error('Error loading font:', error);
			fontError = true;
			showNotification('فشل تحميل الخط', 'error');
		} finally {
			fontLoading = false;
		}
	}

	function copyText() {
		navigator.clipboard.writeText(text).then(() => showNotification('تم نسخ النص'));
	}

	$: if (fontPage) loadFont();

	onMount(() => loadFont());
</script>

<Tabs value={currentFont} onValueChange={(val) => (currentFont = val)}>
	<TabsList class="mb-4 grid grid-cols-2">
		{#each fontConfigs as config}
			<TabsTrigger value={config.id}>{config.name}</TabsTrigger>
		{/each}
	</TabsList>

	{#each fontConfigs as config}
		<TabsContent value={config.id}>
			<div class="space-y-4">
				<div class="flex items-end gap-4">
					<div class="space-y-2">
						<Label>صفحة الخط</Label>
						<Input type="number" bind:value={fontPage} min="1" max={config.maxPage} class="w-24" />
					</div>

					<div class="flex-1 space-y-2">
						<Label>اسم الخط</Label>
						<div class="rounded border bg-gray-50 p-2">{fontFamily}</div>
					</div>

					<Button variant="outline" on:click={loadFont} disabled={fontLoading}>
						{fontLoading ? 'جاري التحميل...' : 'تحميل الخط'}
					</Button>
				</div>

				<div class="space-y-2">
					<Label>النص</Label>
					<Textarea bind:value={text} placeholder="أدخل النص..." class="min-h-20" dir="rtl" />
				</div>

				<Card>
					<CardHeader>
						<CardTitle class="flex justify-between">
							<span>معاينة الخط</span>
							<Button variant="ghost" size="sm" on:click={copyText}>
								<CopyIcon class="ml-2 h-4 w-4" />
								نسخ
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{#if fontError}
							<div class="p-4 text-center text-red-500">
								فشل تحميل الخط. يرجى التحقق من الاتصال بالإنترنت أو تجربة صفحة أخرى.
							</div>
						{:else}
							<div
								class="flex min-h-32 items-center justify-center rounded-md border p-4 text-2xl"
								style="font-family: '{fontFamily}', 'Kitab', sans-serif;"
							>
								{text}
							</div>
						{/if}
					</CardContent>
				</Card>

				<div class="mt-2 text-xs text-gray-500">
					<p>نطاق الخط: 1 - {config.maxPage}</p>
					<p>المصدر: {config.url}</p>
				</div>
			</div>
		</TabsContent>
	{/each}
</Tabs>
