import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Quote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getReviewSchema } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: "Testimonials | What Clients Say About Paul Thames",
  description: "What clients, captains, and industry professionals say about working with Edwin Edelenbos on superyacht AV/IT, lighting, and technology projects.",
};

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  highlight?: string;
  project?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Klaus Waibel",
    role: "Captain / Owner's Representative",
    project: "Project 823, Royal Van Lent Shipyard (2020–2023)",
    highlight: "In a nutshell, Edwin is a good chap who knows what he is talking about.",
    quote:
      "Edwin is firstly a very pleasant and straight forward person to communicate with on these often rather complicated systems and the integration of these systems. I found that his knowledge and advice on choosing the best equipment for our application invaluable as Edwin seems to have a deep well of knowledge, not only on the marketplace of all this type of equipment, but also the equipment itself and the best and most effective method of integration. Due to some unforeseen and rather challenging changes in the supply company of AV/IT equipment, the AV/IT project experienced several changes of project managers on the supply company's side. Edwin handled and managed these challenging changes in a very professional and calm manner, still ensuring that the result and finished project would meet the high standards required for such a system. As the overall responsible person of the build project, I very much appreciated Edwin's advise and help during the project and right up to delivery.",
  },
  {
    name: "Carlos Morales",
    role: "Director General / General Manager, Astilleros de Mallorca",
    highlight: "We had signed the 'Cristiano Ronaldo' of AV/IT!",
    quote:
      "I have known Edwin since my Oceanco years. When I first met him he was working for a subcontractor on a project we had at the yard. I remember that we all, Oceanco's staff, Owner's Rep and the Owner himself were really astonished by his technical knowledge, as well as his ability to explain easily to us non-experts, these high-tech concepts. He was very client oriented, and made the design process a very enjoyable one. It is so rewarding, and rare, to feel that you can fully trust somebody, that your project is definitely in the right hands. Not long after that project, Edwin was signed by Oceanco. I remember the talk when that became known... we had signed the \"Cristiano Ronaldo\" of AV/IT! Over the years I have had the opportunity of working with him on various projects, and getting to know him even better. I can confirm that not only is he an exceptional professional, but that he is also a great human being.",
  },
  {
    name: "Klaudio Marcelic",
    role: "Owner's Representative and Captain, M/Y DAR",
    project: "90m new build",
    highlight: "He became a truly trusted advisor to myself and my team.",
    quote:
      "Edwin was part of the Oceanco yard team on our new build project, and played a crucial role in the design and project management of the AV, IT and lighting systems. During the build he became a truly trusted advisor to myself and my team, and he continues to support us to this day. He has an excellent ability to understand and interpret requirements, and to discuss and present the resulting solutions in a way that is clear to everyone involved. He is honest, transparent and a pleasure to work with. Anyone looking for expert guidance in AV/IT and related systems would do well to seek Edwin out.",
  },
  {
    name: "Derek Munro",
    role: "Director, Owner's Representative, Yacht Consultancy Ltd. UK",
    project: "Project Y712 – 106m SY Black Pearl, Oceanco",
    highlight: "Very knowledgeable about current and future technology and very passionate about his field.",
    quote:
      "I worked with Edwin during the build of project Y712 the 106m sailing yacht SY Black Pearl at Oceanco yacht builders in Alblasserdam. Edwin was always very informative in an unbiased way which was a nice change and made the project more illuminating. I enjoyed the discussions about future technologies and how they could be implemented, along with our chats on best practice for the installation of all equipment. Edwin is very knowledgeable about current and future technology and very passionate about his field of work. It would be a pleasure to work with Edwin on a project in the future.",
  },
  {
    name: "Glenn Dalby",
    role: "Captain & Project Manager",
    project: "90m yacht",
    highlight: "One of the very best.",
    quote:
      "Over the last 2 decades I've had the privilege of working closely with some of the world's most talented AV and IT engineers and their project managers. One of the very best is Edwin Edelenbos; his communication prowess coupled with an immediate and clinically accurate interpretation of a client's expectations and preferences stand out.",
  },
  {
    name: "Ian Grey",
    role: "AV/IT Engineer, 100m+ yacht",
    highlight: "His knowledge of the sector is second to none.",
    quote:
      "I have worked with Edwin both at VBH and also when he was involved as a consultant on a 80m+ yacht. His knowledge of the sector is second to none and his advice is invaluable on any yacht project. He is a pleasure to work with and I would recommend anyone looking for advice or consultation on a refit or new build project to use his services.",
  },
  {
    name: "Confidential",
    role: "Owner's Representative, 110m+ new build yacht",
    project: "115m yacht – AVIT, Events, and Security systems",
    highlight: "He covered everything in great detail with some excellent ideas.",
    quote:
      "During the specification phase we worked with Edwin to build up the AVIT, Events and Security systems. Edwin is very experienced and has a deep knowledge of how the systems are designed and used. He covered everything in great detail with some excellent ideas, and he structured everything simply and efficiently, so once the spec was finalised we could work to contract suitable parties for the build.",
  },
  {
    name: "Nigel Sherlock",
    role: "Representative | Introducer | Ambassador | Facilitator | Mediator",
    highlight: "Whenever Edwin is involved I have a deep sense of comfort.",
    quote:
      "I have known Edwin for many years from the time we worked together and he was my go-to guy for all things technical and I've observed with pleasure and admiration his career progression. Edwin is not only extremely intelligent but he has a vast wealth of knowledge and experience and a very analytical and inquisitive mind with the ability to think outside of the box. Edwin is an absolute pleasure to work with, polite, professional, efficient, incredibly organised and always positive and friendly with a wonderful mix of humbleness and self-depreciation. Whenever Edwin is involved in a project I have a deep sense of comfort knowing that all the technical aspects will be exactly as required and appropriate. But for me the most important aspects with Edwin are his honesty, transparency, ethics and his drive to deliver the best possible solution for his clients.",
  },
  {
    name: "Chris Horn",
    role: "Crestron Programmer, Elixir Programming And Design UK",
    project: "ETO on 80m+ yachts",
    highlight: "Passionate about raising technical standards within the industry.",
    quote:
      "I first worked with Edwin when he was a Technical manager at Oceanco and I was subcontracted to carry out programming through one of their partners. Edwin has a very deep technical understanding of the requirements for AVIT systems onboard yachts from his years at VBH & Oceanco. Not only is he able to engineer and design high reliability systems, he is not afraid to take on cutting edge technologies and integrate them into systems. Edwin is also someone who is passionate about raising technical standards within the industry and making sure owners have the systems onboard that will give them a reliable and enjoyable experience.",
  },
  {
    name: "Tony Bøklepp",
    role: "AV/IT Officer, private 90m yacht",
    project: "90m newbuild, 2-year project",
    highlight: "His deep knowledge and insights were crucial to the project.",
    quote:
      "I was fortunate to meet and work closely with Edwin on a 90m newbuild over a period of about 2 years. His deep knowledge and insights into AV, IT and lighting systems were crucial to the project. Edwin has excellent interpersonal skills and it was great to have someone who was able to mediate between all the various parties involved. I would recommend his services without hesitation.",
  },
  {
    name: "Lucio Prosperi",
    role: "Captain, M.Y. Yasmine of the Sea",
    project: "80m yacht – extensive refit (2018–19)",
    highlight: "The right person to act as independent consultant.",
    quote:
      "Edwin was recommended to me in discussions regarding a feasibility study for an extensive refit to Yasmine of the Sea, carried out during winter 2018-19. Edwin turned out to be the right person to act as independent consultant helping to review, modify and upgrade the proposals for a new AV and IT system on board. His comments and reports after survey visits were very constructive and helpful, giving a good input to a successful project at full Owner satisfaction.",
  },
  {
    name: "Peter Aarts",
    role: "Director of Operations, SuperYacht Times",
    highlight: "The ability to explain difficult things in a simple and trustworthy way.",
    quote:
      "I've known Edwin since 2015. His experience in AV/IT is outstanding! What I really admire is that he is not only an easy guy to connect with, but that he also has the ability to explain difficult things in a simple and trustworthy way. He always comes up with a solution!",
  },
];

const reviewSchemas = testimonials.slice(0, 3).map(t => getReviewSchema({
  author: t.name,
  ratingValue: 5,
  reviewBody: t.highlight || t.quote.substring(0, 200),
  itemReviewed: 'Superyacht Technical Consultancy',
}));

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen py-12">
      {reviewSchemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <div className="container max-w-screen-xl">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Testimonials', href: '/testimonials' },
        ]} />

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-accent font-poppins-medium mb-4">
            Client Testimonials
          </p>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-6 text-accent">
            What Clients Say
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            Feedback from captains, owner&apos;s representatives, and industry professionals
            across newbuild and refit projects.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 mb-20">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-card border border-accent/10 hover:border-accent/25 rounded-2xl p-8 transition-colors flex flex-col"
            >
              <Quote className="w-8 h-8 text-accent/25 mb-4 flex-shrink-0" />

              {testimonial.highlight && (
                <p className="text-lg md:text-xl font-cormorant font-bold text-accent italic mb-4">
                  &ldquo;{testimonial.highlight}&rdquo;
                </p>
              )}

              <p className="text-muted-foreground font-poppins-light leading-relaxed mb-6 flex-grow">
                {testimonial.quote}
              </p>

              <div className="pt-4 border-t border-accent/10">
                <p className="font-poppins-medium text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground font-poppins-light">
                  {testimonial.role}
                </p>
                {testimonial.project && (
                  <p className="text-xs text-muted-foreground/70 font-poppins-light mt-1">
                    {testimonial.project}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-accent/5 rounded-2xl p-12 border border-accent/20">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Discuss Your Project
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Independent technical guidance for superyacht AV/IT, lighting, and control systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
                <a href="mailto:info@paulthames.com?subject=Project Consultancy Inquiry">
                  Get in Touch
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="group rounded-full px-10 py-4">
                <Link href="/consultancy/clients">
                  View Consultancy Services
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
