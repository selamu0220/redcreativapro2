import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { SchemaJSONLD } from "@/lib/seo/SchemaJSONLD"
import { FAQPage, WithContext } from "schema-dts"

interface FAQItem {
    question: string
    answer: string
}

interface FAQSectionProps {
    items: FAQItem[]
    title?: string
    description?: string
}

export function FAQSection({
    items,
    title = "Preguntas Frecuentes",
    description = "Resolvemos tus dudas sobre nuestra IA para periodistas."
}: FAQSectionProps) {

    const faqSchema: WithContext<FAQPage> = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer
            }
        }))
    }

    return (
        <section className="py-12 bg-gray-50 dark:bg-zinc-900/50">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">{title}</h2>
                    <p className="text-muted-foreground">{description}</p>
                </div>

                <SchemaJSONLD json={faqSchema} />

                <Accordion type="single" collapsible className="w-full">
                    {items.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left font-medium">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground prose dark:prose-invert">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
