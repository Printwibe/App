import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ContactForm } from "@/components/contact/contact-form"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export const metadata = {
  title: "Contact Us - PrintWibe",
  description: "Get in touch with PrintWibe. We're here to help with your custom printing needs.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">Get In Touch</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions about custom printing or need help with your order? We're here to help. Reach out to us and
              we'll get back to you as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="font-serif text-2xl font-medium mb-6">Send Us a Message</h2>
                <ContactForm />
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="font-serif text-2xl font-medium mb-6">Contact Information</h2>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Our Address</h3>
                      <p className="text-muted-foreground">
                        123 Print Street, Design District
                        <br />
                        Mumbai, Maharashtra 400001
                        <br />
                        India
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <p className="text-muted-foreground">
                        +91 98765 43210
                        <br />
                        +91 12345 67890
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <p className="text-muted-foreground">
                        support@printwibe.com
                        <br />
                        orders@printwibe.com
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Business Hours</h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM
                        <br />
                        Saturday: 10:00 AM - 4:00 PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-10 p-6 bg-secondary rounded-lg">
                  <h3 className="font-medium mb-3">Frequently Asked Questions</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>
                      <strong className="text-foreground">How long does custom printing take?</strong>
                      <br />
                      Most custom orders are completed within 3-5 business days.
                    </li>
                    <li>
                      <strong className="text-foreground">What file formats do you accept?</strong>
                      <br />
                      We accept PNG, JPG, and SVG files with a minimum resolution of 300 DPI.
                    </li>
                    <li>
                      <strong className="text-foreground">Do you offer bulk discounts?</strong>
                      <br />
                      Yes! Contact us for orders of 10+ items for special pricing.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
