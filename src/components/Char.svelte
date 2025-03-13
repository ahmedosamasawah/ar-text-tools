<script>
    import { Button } from "$lib/components/ui/button";
    import { CopyIcon, ExternalLinkIcon } from "lucide-svelte";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    
    export let char = '';
    export let onCopy = () => {};
    
    // Calculate codepoint
    $: codepoint = 'U+' + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
    $: category = getCategory(char);
    
    // Get character category
    function getCategory(c) {
      const code = c.charCodeAt(0);
      
      if (code >= 0x0600 && code <= 0x06FF) return "Arabic";
      if (code >= 0x0750 && code <= 0x077F) return "Arabic Supplement";
      if (code >= 0x08A0 && code <= 0x08FF) return "Arabic Extended-A";
      if (code >= 0xFB50 && code <= 0xFDFF) return "Arabic Presentation Forms-A";
      if (code >= 0xFE70 && code <= 0xFEFF) return "Arabic Presentation Forms-B";
      
      return "Other";
    }
  </script>
  
  <Card class="w-28 h-36 flex flex-col">
    <CardHeader class="p-2 text-center">
      <CardTitle class="text-3xl font-normal">{char}</CardTitle>
    </CardHeader>
    
    <CardContent class="p-2 text-center text-xs space-y-1 mt-auto">
      <div class="font-mono">{codepoint}</div>
      <div class="text-gray-500 truncate" title={category}>{category}</div>
      
      <div class="flex gap-1 justify-center mt-2">
        <Button 
          variant="ghost" 
          size="sm"
          class="h-6 px-2"
          on:click={() => onCopy(char)}
        >
          <CopyIcon class="h-3 w-3" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          class="h-6 px-2"
          as="a"
          href={`https://codepoints.net/${codepoint}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLinkIcon class="h-3 w-3" />
        </Button>
      </div>
    </CardContent>
  </Card>