import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = "https://kiauvyulzwhfhfsfzuug.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Demo user email - data belonging to this user will be reset
const DEMO_USER_EMAIL = "demo@aurem.it";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get demo user ID
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Failed to list users: ${userError.message}`);
    }

    const demoUser = userData.users.find(u => u.email === DEMO_USER_EMAIL);
    
    if (!demoUser) {
      return new Response(
        JSON.stringify({ success: false, message: "Demo user not found. Please create demo@aurem.it user first." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const demoUserId = demoUser.id;
    console.log(`Resetting data for demo user: ${demoUserId}`);

    // Delete demo user's data from all tables (in correct order to respect foreign keys)
    const deleteOperations = [
      // First delete dependent records
      { table: "quote_items", column: null, joinTable: "quotes" },
      { table: "product_serials", column: "created_by" },
      { table: "stock_movements", column: "created_by" },
      { table: "chat_messages", column: "sender_id" },
      { table: "chat_members", column: "user_id" },
      { table: "notifications", column: "user_id" },
      // Then delete main records
      { table: "quotes", column: "created_by" },
      { table: "contracts", column: "created_by" },
      { table: "customers", column: "created_by" },
      { table: "products", column: "created_by" },
      { table: "tasks", column: "created_by" },
    ];

    const results: { table: string; deleted: number; error?: string }[] = [];

    for (const op of deleteOperations) {
      try {
        if (op.joinTable) {
          // For quote_items, we need to delete based on quotes created by demo user
          const { data: quotes } = await supabase
            .from("quotes")
            .select("id")
            .eq("created_by", demoUserId);
          
          if (quotes && quotes.length > 0) {
            const quoteIds = quotes.map(q => q.id);
            const { error } = await supabase
              .from(op.table)
              .delete()
              .in("quote_id", quoteIds);
            
            if (error) throw error;
            results.push({ table: op.table, deleted: quoteIds.length });
          } else {
            results.push({ table: op.table, deleted: 0 });
          }
        } else if (op.column) {
          const { error, count } = await supabase
            .from(op.table)
            .delete()
            .eq(op.column, demoUserId);
          
          if (error) throw error;
          results.push({ table: op.table, deleted: count || 0 });
        }
      } catch (err: any) {
        console.error(`Error deleting from ${op.table}:`, err.message);
        results.push({ table: op.table, deleted: 0, error: err.message });
      }
    }

    // Insert sample demo data
    const now = new Date().toISOString();
    
    // Create sample customers
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .insert([
        {
          customer_type: "azienda",
          company_name: "Acme S.r.l.",
          partita_iva: "IT12345678901",
          codice_sdi: "XXXXXXX",
          email: "info@acme.it",
          phone: "+39 02 1234567",
          address: "Via Roma 1",
          city: "Milano",
          province: "MI",
          postal_code: "20100",
          country: "Italia",
          created_by: demoUserId,
          active: true,
        },
        {
          customer_type: "azienda",
          company_name: "Tech Solutions S.p.A.",
          partita_iva: "IT98765432109",
          codice_sdi: "YYYYYYY",
          email: "contact@techsolutions.it",
          phone: "+39 06 9876543",
          address: "Via Veneto 50",
          city: "Roma",
          province: "RM",
          postal_code: "00187",
          country: "Italia",
          created_by: demoUserId,
          active: true,
        },
        {
          customer_type: "persona_fisica",
          first_name: "Mario",
          last_name: "Rossi",
          codice_fiscale: "RSSMRA80A01H501Z",
          email: "mario.rossi@email.it",
          mobile: "+39 333 1234567",
          address: "Via Garibaldi 10",
          city: "Firenze",
          province: "FI",
          postal_code: "50123",
          country: "Italia",
          created_by: demoUserId,
          active: true,
        },
      ])
      .select();

    if (customersError) {
      console.error("Error creating demo customers:", customersError);
    }

    // Create sample products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .insert([
        {
          code: "PROD-001",
          name: "Laptop Business Pro",
          description: "Notebook professionale 15.6 pollici",
          brand: "TechBrand",
          model: "BP-2024",
          purchase_price: 800,
          sale_price: 1200,
          stock_quantity: 10,
          min_stock_level: 2,
          has_serial: true,
          created_by: demoUserId,
          active: true,
        },
        {
          code: "PROD-002",
          name: "Monitor 27\" 4K",
          description: "Monitor Ultra HD IPS",
          brand: "DisplayMax",
          model: "DM-27UHD",
          purchase_price: 350,
          sale_price: 499,
          stock_quantity: 15,
          min_stock_level: 3,
          has_serial: true,
          created_by: demoUserId,
          active: true,
        },
        {
          code: "PROD-003",
          name: "Tastiera Wireless",
          description: "Tastiera meccanica bluetooth",
          brand: "KeyPro",
          model: "KP-MECH",
          purchase_price: 45,
          sale_price: 79,
          stock_quantity: 50,
          min_stock_level: 10,
          has_serial: false,
          created_by: demoUserId,
          active: true,
        },
      ])
      .select();

    if (productsError) {
      console.error("Error creating demo products:", productsError);
    }

    // Create sample tasks
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { error: tasksError } = await supabase
      .from("tasks")
      .insert([
        {
          title: "Chiamare cliente Acme",
          description: "Follow-up sulla proposta commerciale inviata",
          priority: "alta",
          status: "da_fare",
          due_date: tomorrow.toISOString().split("T")[0],
          created_by: demoUserId,
        },
        {
          title: "Preparare preventivo Tech Solutions",
          description: "Preventivo per fornitura hardware ufficio",
          priority: "media",
          status: "in_corso",
          due_date: nextWeek.toISOString().split("T")[0],
          created_by: demoUserId,
        },
        {
          title: "Controllo inventario magazzino",
          description: "Verifica scorte minime e ordini",
          priority: "bassa",
          status: "da_fare",
          due_date: nextWeek.toISOString().split("T")[0],
          created_by: demoUserId,
        },
      ]);

    if (tasksError) {
      console.error("Error creating demo tasks:", tasksError);
    }

    // Create sample contracts
    const contractStart = new Date();
    const contractEnd = new Date();
    contractEnd.setFullYear(contractEnd.getFullYear() + 1);

    if (customers && customers.length > 0) {
      const { error: contractsError } = await supabase
        .from("contracts")
        .insert([
          {
            contract_number: "CNT-2024-001",
            title: "Contratto Manutenzione IT",
            contract_type: "esterno",
            customer_id: customers[0].id,
            start_date: contractStart.toISOString().split("T")[0],
            end_date: contractEnd.toISOString().split("T")[0],
            contract_value: 12000,
            status: "attivo",
            auto_renewal: true,
            renewal_notice_days: 30,
            created_by: demoUserId,
          },
        ]);

      if (contractsError) {
        console.error("Error creating demo contracts:", contractsError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo data reset successfully",
        timestamp: now,
        deletedRecords: results,
        createdRecords: {
          customers: customers?.length || 0,
          products: products?.length || 0,
          tasks: 3,
          contracts: customers ? 1 : 0,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Reset demo data error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
