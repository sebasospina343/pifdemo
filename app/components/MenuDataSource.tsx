import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import EnvironmentCombo from "./EnvironmentCombo"
import NewEnvironmentDialog from "./NewEnvironmentDialog"

export default function MenuDataSource() {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-center text-center">
        <h1 className="text-lg py-2 bg-amber-600 text-white w-full rounded-t-lg">
          Data Sources
        </h1>
      </header>

      <Collapsible className="px-2">
        <CollapsibleTrigger className="w-full font-bold border-b-2 border-slate-800 pb-2 text-left">
          Environments
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-4 my-4">
          <EnvironmentCombo />
          <NewEnvironmentDialog />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
