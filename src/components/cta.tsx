import { CONTACT_EMAIL } from '@/lib/constants'

export default function Cta() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-5xl font-medium text-gray-900 mb-4">
            Trope.<br />
            <span className="text-gray-400">Do it all.</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Transform tribal knowledge into living guides that keep your team aligned.
          </p>
          <a
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all duration-200"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            Talk to Sales
          </a>
        </div>
      </div>
    </section>
  )
}