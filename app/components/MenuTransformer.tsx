import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function MenuTransformer() {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-center text-center">
        <h1 className="text-lg py-2 bg-green-600 text-white w-full rounded-t-lg">
          Transformer
        </h1>
      </header>

      <Collapsible className="px-2">
        <CollapsibleTrigger className="w-full font-bold border-b-2 border-slate-800 pb-2 text-left">
          Transformers
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-4 my-4">
          XXX Transformers will go here XXX
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
