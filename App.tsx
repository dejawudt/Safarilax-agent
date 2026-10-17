import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
} from "react-native";

// Mock lodge inventory indexed for SafariLax East Africa
const INVENTORY = [
  { name: "Angama Mara", loc: "Maasai Mara, Kenya", tier: "Ultra-Luxury", rate: 1850 },
  { name: "Elewana Tortilis", loc: "Amboseli, Kenya", tier: "Luxury", rate: 950 },
  { name: "Singita Faru Faru", loc: "Serengeti, Tanzania", tier: "Ultra-Luxury", rate: 2400 },
  { name: "Wilderness Bisate", loc: "Volcanoes NP, Rwanda", tier: "Ultra-Luxury", rate: 2900 }
];

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Jambo! I am your SafariLax Private Concierge. Tell me, what does your ideal African safari look like? (e.g., party size, target travel dates, wildlife bucket list)"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({ party_size: null, travel_window: null, interests: [] });
  const [itinerary, setItinerary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"concierge" | "itinerary">("concierge");
  const scrollViewRef = useRef<ScrollView>(null);

  // Autonomous Multi-Agent Reasoning Loop
  const sendAutonomousTurn = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    const newHistory = [...messages, { role: "user", content: userText }];
    setMessages(newHistory);
    setLoading(true);

    // DEMO FALLBACK: If no OpenAI key is set, run simulated autonomous agent
    if (!apiKey.trim()) {
      setTimeout(() => {
        const simulatedProfile = {
          party_size: profile.party_size || 2,
          travel_window: profile.travel_window || "August 2026",
          interests: ["Great Migration", "Big Cats", "Bush Breakfast"]
        };
        const simulatedItinerary = {
          title: "The Great Mara & Amboseli Horizon",
          total_days: 5,
          total_estimated_usd: 8400,
          schedule: [
            {
              day: 1,
              location: "Amboseli National Park",
              lodge: "Elewana Tortilis Camp",
              est_cost_usd: 950,
              activities: ["Kilimanjaro backdrop landing", "Afternoon elephant herd game drive"]
            },
            {
              day: 2,
              location: "Maasai Mara Reserve",
              lodge: "Angama Mara",
              est_cost_usd: 1850,
              activities: ["Private bush flight transfer", "Sunset lion pride tracking"]
            },
            {
              day: 3,
              location: "Mara River Triangle",
              lodge: "Angama Mara",
              est_cost_usd: 1850,
              activities: ["Great Migration river crossing watch", "Champagne bush breakfast"]
            },
            {
              day: 4,
              location: "Serengeti Migration Corridor",
              lodge: "Singita Faru Faru",
              est_cost_usd: 2400,
              activities: ["Exclusive private concession drive", "Stargazing nocturnal safari"]
            }
          ]
        };

        setProfile(simulatedProfile);
        setItinerary(simulatedItinerary);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I have understood your vision! I've autonomously crafted your bespoke 5-day luxury itinerary: 'The Great Mara & Amboseli Horizon'. Tap the 'Bespoke Plan ✨' tab above to review full pricing, lodges, and daily activities!"
          }
        ]);
        setLoading(false);
      }, 1200);
      return;
    }

    // LIVE GPT-4o AUTONOMOUS AGENT (When API Key is entered)
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are the SafariLax Autonomous Concierge.
Extract user preferences and synthesize an itinerary once dates and party size are known.
Lodges: ${JSON.stringify(INVENTORY)}
Output JSON:
{
  "reply": "Concierge reply",
  "extracted_profile": { "party_size": number or null, "travel_window": string or null },
  "itinerary": null or {
    "title": "Title",
    "total_days": 4,
    "total_estimated_usd": 6800,
    "schedule": [
      { "day": 1, "location": "Maasai Mara", "lodge": "Angama Mara", "est_cost_usd": 1850, "activities": ["Private Mara Game Drive"] }
    ]
  }
}`
            },
            ...newHistory.map((m) => ({ role: m.role, content: m.content }))
          ]
        })
      });

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);

      setMessages((prev) => [...prev, { role: "assistant", content: parsed.reply }]);
      if (parsed.extracted_profile) setProfile((prev: any) => ({ ...prev, ...parsed.extracted_profile }));
      if (parsed.itinerary) setItinerary(parsed.itinerary);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Agent Error: " + (e.message || "Failed request") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1412" />

      {/* Brand Header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Text style={styles.brandTitle}>SAFARILAX</Text>
          <TouchableOpacity onPress={() => setShowKeyModal(true)} style={styles.keyBtn}>
            <Text style={styles.keyBtnText}>{apiKey ? "Key Set ✓" : "Demo Mode / Set Key"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.brandSubtitle}>AUTONOMOUS LUXURY CONCIERGE</Text>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "concierge" && styles.activeTabButton]}
            onPress={() => setActiveTab("concierge")}
          >
            <Text style={[styles.tabText, activeTab === "concierge" && styles.activeTabText]}>Concierge</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "itinerary" && styles.activeTabButton]}
            onPress={() => setActiveTab("itinerary")}
          >
            <Text style={[styles.tabText, activeTab === "itinerary" && styles.activeTabText]}>
              Bespoke Plan {itinerary ? "✨" : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab 1: Concierge View */}
      {activeTab === "concierge" ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {/* Autonomous Status Badges */}
          <View style={styles.statusPills}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{profile.party_size ? `◈ Party: ${profile.party_size} Guests` : "◈ Party: Detecting..."}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{profile.travel_window ? `◈ Dates: ${profile.travel_window}` : "◈ Dates: Detecting..."}</Text>
            </View>
          </View>

          {/* Conversation Stream */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatScrollContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((m, i) => (
              <View key={i} style={[styles.bubble, m.role === "user" ? styles.userBubble : styles.assistantBubble]}>
                <Text style={m.role === "user" ? styles.userText : styles.assistantText}>{m.content}</Text>
              </View>
            ))}

            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#C6A052" />
                <Text style={styles.loadingText}>Concierge reasoning & curating inventory...</Text>
              </View>
            )}
          </ScrollView>

          {/* Chat Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2 adults looking to see the Migration in August..."
              placeholderTextColor="#71717A"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendAutonomousTurn}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendAutonomousTurn} disabled={loading}>
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        /* Tab 2: Dynamic Live Safari Canvas */
        <ScrollView style={styles.itineraryContainer} contentContainerStyle={{ paddingBottom: 40 }}>
          {itinerary ? (
            <View style={styles.itineraryCard}>
              <Text style={styles.badge}>AUTONOMOUSLY CURATED</Text>
              <Text style={styles.itineraryTitle}>{itinerary.title}</Text>
              <Text style={styles.totalPrice}>${itinerary.total_estimated_usd?.toLocaleString()} USD</Text>
              <Text style={styles.priceSub}>{itinerary.total_days} Days / Private Bespoke Safari</Text>

              {/* Day Breakdown */}
              <View style={{ marginTop: 14 }}>
                {itinerary.schedule?.map((item: any) => (
                  <View key={item.day} style={styles.dayBox}>
                    <View style={styles.dayTopRow}>
                      <Text style={styles.dayHeader}>DAY {item.day}: {item.location}</Text>
                      <Text style={styles.dayCost}>${item.est_cost_usd}</Text>
                    </View>
                    <Text style={styles.dayLodge}>Stay: {item.lodge}</Text>
                    {item.activities?.map((act: string, idx: number) => (
                      <Text key={idx} style={styles.activityText}>• {act}</Text>
                    ))}
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.reserveBtn}>
                <Text style={styles.reserveBtnText}>Hold Dates & Proceed to Deposit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>✦</Text>
              <Text style={styles.emptyTitle}>No Itinerary Built Yet</Text>
              <Text style={styles.emptyDesc}>
                Converse with your concierge on the first tab. Once party details and target dates are mentioned, your custom safari will render here autonomously.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Optional API Key Setup Modal */}
      <Modal visible={showKeyModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Concierge Intelligence Setup</Text>
            <Text style={styles.modalSub}>
              Enter your OpenAI API key for live GPT-4o reasoning, or leave it blank to run in Demo Mode.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="sk-proj-..."
              placeholderTextColor="#666"
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setShowKeyModal(false)}>
              <Text style={styles.modalDoneText}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F1412" },
  header: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#1F2923" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandTitle: { fontSize: 20, fontWeight: "bold", color: "#F4F4F5", letterSpacing: 2 },
  brandSubtitle: { fontSize: 9, color: "#C6A052", letterSpacing: 1.5, marginTop: 2, fontWeight: "700" },
  keyBtn: { backgroundColor: "#1D2821", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: "#C6A052" },
  keyBtnText: { color: "#C6A052", fontSize: 11, fontWeight: "600" },
  tabContainer: { flexDirection: "row", marginTop: 12, backgroundColor: "#171F1A", borderRadius: 8, padding: 3 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  activeTabButton: { backgroundColor: "#C6A052" },
  tabText: { fontSize: 12, color: "#A1A1AA", fontWeight: "600" },
  activeTabText: { color: "#000" },
  statusPills: { flexDirection: "row", gap: 8, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: "#141C18" },
  pill: { backgroundColor: "#1C2721", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pillText: { fontSize: 11, color: "#C6A052" },
  chatScroll: { flex: 1 },
  chatScrollContent: { padding: 14, gap: 10 },
  bubble: { maxWidth: "84%", padding: 12, borderRadius: 14 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#C6A052", borderBottomRightRadius: 2 },
  assistantBubble: { alignSelf: "flex-start", backgroundColor: "#18211C", borderWidth: 1, borderColor: "#27342C", borderBottomLeftRadius: 2 },
  userText: { color: "#000", fontSize: 13, fontWeight: "500" },
  assistantText: { color: "#FFF", fontSize: 13, lineHeight: 18 },
  loadingBox: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  loadingText: { color: "#C6A052", fontSize: 12 },
  inputContainer: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderTopColor: "#1F2923", backgroundColor: "#141B17", gap: 8 },
  input: { flex: 1, backgroundColor: "#0F1412", borderWidth: 1, borderColor: "#27342C", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, color: "#FFF", fontSize: 13 },
  sendButton: { backgroundColor: "#C6A052", width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sendButtonText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  itineraryContainer: { flex: 1, padding: 14 },
  itineraryCard: { backgroundColor: "#151D18", borderRadius: 14, borderWidth: 1, borderColor: "#C6A052", padding: 16 },
  badge: { fontSize: 10, color: "#C6A052", fontWeight: "800", letterSpacing: 1 },
  itineraryTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF", marginTop: 4 },
  totalPrice: { fontSize: 24, fontWeight: "bold", color: "#FFF", marginTop: 8 },
  priceSub: { fontSize: 11, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: 0.5 },
  dayBox: { backgroundColor: "#0F1412", padding: 10, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: "#222D25" },
  dayTopRow: { flexDirection: "row", justifyContent: "space-between" },
  dayHeader: { fontSize: 12, fontWeight: "bold", color: "#C6A052" },
  dayCost: { fontSize: 12, color: "#A1A1AA" },
  dayLodge: { fontSize: 12, color: "#FFF", marginTop: 2 },
  activityText: { fontSize: 11, color: "#8E9290", marginTop: 2 },
  reserveBtn: { backgroundColor: "#C6A052", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 14 },
  reserveBtnText: { color: "#000", fontWeight: "bold", fontSize: 13 },
  emptyBox: { alignItems: "center", justifyContent: "center", marginTop: 100, paddingHorizontal: 30 },
  emptyIcon: { color: "#3F3F46", fontSize: 36, marginBottom: 12 },
  emptyTitle: { color: "#71717A", fontSize: 16, fontWeight: "bold" },
  emptyDesc: { color: "#52525B", fontSize: 12, textAlign: "center", marginTop: 6, lineHeight: 18 },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#161D19", padding: 20, borderRadius: 14, borderWidth: 1, borderColor: "#C6A052" },
  modalTitle: { color: "#FFF", fontSize: 17, fontWeight: "bold" },
  modalSub: { color: "#A1A1AA", fontSize: 12, marginTop: 6, lineHeight: 16 },
  modalInput: { backgroundColor: "#0F1412", borderWidth: 1, borderColor: "#27342C", borderRadius: 8, padding: 10, color: "#FFF", fontSize: 13, marginTop: 14 },
  modalDoneBtn: { backgroundColor: "#C6A052", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 14 },
  modalDoneText: { color: "#000", fontWeight: "bold" },
});
