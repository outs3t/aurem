import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketEmailRequest {
  ticketNumber: string;
  customerName: string;
  email: string;
  subject: string;
  description: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticketNumber, customerName, email, subject, description }: TicketEmailRequest = await req.json();

    console.log("Sending ticket confirmation email:", { ticketNumber, email });

    const emailResponse = await resend.emails.send({
      from: "CRM Support <onboarding@resend.dev>",
      to: [email],
      subject: `Ticket #${ticketNumber} - Conferma ricezione`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              .badge { display: inline-block; background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✓ Ticket Ricevuto</h1>
                <p>Grazie per averci contattato</p>
              </div>
              <div class="content">
                <p>Gentile <strong>${customerName}</strong>,</p>
                <p>Abbiamo ricevuto la tua richiesta e il nostro team la prenderà in carico al più presto.</p>
                
                <div class="ticket-info">
                  <p><strong>Numero Ticket:</strong> <span class="badge">${ticketNumber}</span></p>
                  <p><strong>Oggetto:</strong> ${subject}</p>
                  <p><strong>Descrizione:</strong></p>
                  <p style="padding: 10px; background: #f5f5f5; border-radius: 5px;">${description}</p>
                </div>
                
                <p>Riceverai una risposta entro <strong>24-48 ore lavorative</strong>.</p>
                <p>Per qualsiasi chiarimento, rispondi a questa email indicando il numero del ticket.</p>
                
                <p>Cordiali saluti,<br><strong>Il Team di Supporto</strong></p>
              </div>
              <div class="footer">
                <p>Questa è una email automatica, per favore non rispondere direttamente.</p>
                <p>© 2025 CRM Support. Tutti i diritti riservati.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending ticket email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
