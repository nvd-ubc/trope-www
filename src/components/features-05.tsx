import Image from 'next/image'
import Illustration from '@public/images/pricing-illustration.svg'
import IllustrationTop from '@public/images/pricing-illustration-top.svg'
import Icon01 from '@public/images/pricing-icon-01.svg'
import Icon02 from '@public/images/pricing-icon-02.svg'
import Icon03 from '@public/images/pricing-icon-03.svg'
import Icon04 from '@public/images/pricing-icon-04.svg'
import Icon05 from '@public/images/pricing-icon-05.svg'
import Icon06 from '@public/images/pricing-icon-06.svg'
import Icon07 from '@public/images/pricing-icon-07.svg'
import Particles from '@/components/particles'

export default function Features05() {
  return (
    <section className="relative">

      {/* Particles animation */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 -z-10 w-64 h-64 -mt-24">
        <Particles className="absolute inset-0 -z-10" quantity={6} staticity={30} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pb-12 md:pb-20">

          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12">
            <h2 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-4">Everything you need to scale knowledge</h2>
            <p className="text-lg text-slate-400">From capture to guidance to automation—Trope gives you the full toolkit to eliminate tribal knowledge and keep your team aligned as you grow.</p>
          </div>

          {/* Rings illustration */}
          <div className="text-center pb-8">
            <div className="inline-flex items-center justify-center relative">
              {/* Particles animation */}
              <Particles className="absolute inset-0 -z-10" quantity={10} />
              <div className="inline-flex">
                <Image src={Illustration} width="334" height="334" alt="Features illustration" />
              </div>
              <Image className="absolute -mt-[40%]" src={IllustrationTop} width="396" height="328" alt="Features illustration top" aria-hidden="true" />
              <div className="absolute w-[200%] flex items-center justify-center space-x-5">
                <div className="-rotate-[4deg]">
                  <Image className="w-11 h-11 drop-shadow-lg animate-[float_2.6s_ease-in-out_infinite] opacity-10" src={Icon01} width={80} height={80} alt="Pricing icon 01" />
                </div>
                <div className="rotate-[4deg]">
                  <Image className="w-14 h-14 drop-shadow-lg animate-[float_2.4s_ease-in-out_infinite] opacity-25" src={Icon02} width={80} height={80} alt="Pricing icon 02" />
                </div>
                <div className="-rotate-[4deg]">
                  <Image className="w-16 h-16 drop-shadow-lg animate-[float_2.2s_ease-in-out_infinite] opacity-60" src={Icon03} width={80} height={80} alt="Pricing icon 03" />
                </div>
                <Image className="drop-shadow-lg animate-float" src={Icon04} width={80} height={80} alt="Pricing icon 04" />
                <div className="rotate-[4deg]">
                  <Image className="w-16 h-16 drop-shadow-lg animate-[float_2.2s_ease-in-out_infinite] opacity-60" src={Icon05} width={80} height={80} alt="Pricing icon 05" />
                </div>
                <div className="-rotate-[4deg]">
                  <Image className="w-14 h-14 drop-shadow-lg animate-[float_2.4s_ease-in-out_infinite] opacity-25" src={Icon06} width={80} height={80} alt="Pricing icon 06" />
                </div>
                <div className="rotate-[4deg]">
                  <Image className="w-11 h-11 drop-shadow-lg animate-[float_2.6s_ease-in-out_infinite] opacity-10" src={Icon07} width={80} height={80} alt="Pricing icon 07" />
                </div>
              </div>
            </div>
          </div>

          {/* Features list */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card #1 */}
            <div className="bg-linear-to-tr from-slate-800/50 to-slate-800/10 rounded-3xl border border-slate-800">
              <div className="flex items-center space-x-4 p-4 h-full">
                <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <path className="fill-purple-500" fillOpacity=".24" d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Z" />
                  <path className="fill-purple-400" fillRule="nonzero" d="M13 6.586 14.414 8l-5.747 5.748-3.081-3.081L7 9.252l1.667 1.667z" />
                </svg>
                <p className="text-sm text-slate-400">
                  <strong className="text-slate-300 font-medium">Desktop & Web capture</strong> for Excel, QuickBooks, and all your browser-based apps—not just websites.
                </p>
              </div>
            </div>
            {/* Card #2 */}
            <div className="bg-linear-to-tr from-slate-800/50 to-slate-800/10 rounded-3xl border border-slate-800">
              <div className="flex items-center space-x-4 p-4 h-full">
                <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <path className="fill-purple-500" fillOpacity=".24" d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Z" />
                  <path className="fill-purple-400" fillRule="nonzero" d="M13 6.586 14.414 8l-5.747 5.748-3.081-3.081L7 9.252l1.667 1.667z" />
                </svg>
                <p className="text-sm text-slate-400">
                  <strong className="text-slate-300 font-medium">Drift detection</strong> automatically flags outdated steps when apps or documents change.
                </p>
              </div>
            </div>
            {/* Card #3 */}
            <div className="bg-linear-to-tr from-slate-800/50 to-slate-800/10 rounded-3xl border border-slate-800">
              <div className="flex items-center space-x-4 p-4 h-full">
                <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <path className="fill-purple-500" fillOpacity=".24" d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Z" />
                  <path className="fill-purple-400" fillRule="nonzero" d="M13 6.586 14.414 8l-5.747 5.748-3.081-3.081L7 9.252l1.667 1.667z" />
                </svg>
                <p className="text-sm text-slate-400">
                  <strong className="text-slate-300 font-medium">In-app overlays</strong> guide your team right where they work—no context switching required.
                </p>
              </div>
            </div>
            {/* Card #4 */}
            <div className="bg-linear-to-tr from-slate-800/50 to-slate-800/10 rounded-3xl border border-slate-800">
              <div className="flex items-center space-x-4 p-4 h-full">
                <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <path className="fill-purple-500" fillOpacity=".24" d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Z" />
                  <path className="fill-purple-400" fillRule="nonzero" d="M13 6.586 14.414 8l-5.747 5.748-3.081-3.081L7 9.252l1.667 1.667z" />
                </svg>
                <p className="text-sm text-slate-400">
                  <strong className="text-slate-300 font-medium">Safe automation</strong> with human-in-the-loop approval for critical steps and full audit trails.
                </p>
              </div>
            </div>
            {/* Card #5 */}
            <div className="bg-linear-to-tr from-slate-800/50 to-slate-800/10 rounded-3xl border border-slate-800">
              <div className="flex items-center space-x-4 p-4 h-full">
                <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <path className="fill-purple-500" fillOpacity=".24" d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Z" />
                  <path className="fill-purple-400" fillRule="nonzero" d="M13 6.586 14.414 8l-5.747 5.748-3.081-3.081L7 9.252l1.667 1.667z" />
                </svg>
                <p className="text-sm text-slate-400">
                  <strong className="text-slate-300 font-medium">Role-based permissions</strong> ensure the right people see the right workflows and automations.
                </p>
              </div>
            </div>
            {/* Card #6 */}
            <div className="bg-linear-to-tr from-slate-800/50 to-slate-800/10 rounded-3xl border border-slate-800">
              <div className="flex items-center space-x-4 p-4 h-full">
                <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <path className="fill-purple-500" fillOpacity=".24" d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Z" />
                  <path className="fill-purple-400" fillRule="nonzero" d="M13 6.586 14.414 8l-5.747 5.748-3.081-3.081L7 9.252l1.667 1.667z" />
                </svg>
                <p className="text-sm text-slate-400">
                  <strong className="text-slate-300 font-medium">Version control & lineage</strong> track every workflow change with full rollback capabilities.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}