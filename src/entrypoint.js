import { mountPanel } from './ui/App.jsx'
import { asProgram } from './programs/as.js'
import { lifemilesProgram } from './programs/lifemiles.js'
import { cxProgram } from './programs/cx.js'
import { brProgram } from './programs/br.js'
import { jxProgram } from './programs/jx.js'
import { fbProgram } from './programs/fb.js'
import { jalProgram } from './programs/jal.js'
import { anaProgram } from './programs/ana.js'
import { acProgram } from './programs/ac.js'
import { aaProgram } from './programs/aa.js'
import { ihgProgram } from './programs/ihg.js'
import { marriottProgram } from './programs/marriott.js'
import { hiltonProgram } from './programs/hilton.js'
import { hyattProgram } from './programs/hyatt.js'
import { choiceProgram } from './programs/choice.js'
import { ipreferProgram } from './programs/iprefer.js'
import { preferredHotelsProgram } from './programs/preferred-choice.js'

// Dispatch: pick the right program (airline or hotel) for this hostname and mount the panel (session wiring lives in the UI)

const ALL_PROGRAMS = [asProgram, lifemilesProgram, cxProgram, brProgram, jxProgram, fbProgram, jalProgram, anaProgram, acProgram, aaProgram, ihgProgram, marriottProgram, hiltonProgram, hyattProgram, choiceProgram, ipreferProgram, preferredHotelsProgram]
const program = ALL_PROGRAMS.find(p => p.matchHost?.(location.hostname) ?? p.matches.includes(location.hostname))

// program is undefined when not on a supported site
if (program) {
  if (document.body) mountPanel(program)
  else document.addEventListener('DOMContentLoaded', () => mountPanel(program))
}
