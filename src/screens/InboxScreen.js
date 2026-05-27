import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { fetchConversations } from '../utils/api';

const PLATFORM_COLORS = {
  instagram: { bg: '#fce7f3', text: '#9d174d', label: 'Instagram' },
  facebook: { bg: '#dbeafe', text: '#1e40af', label: 'Facebook' },
  gmail: { bg: '#ffedd5', text: '#9a3412', label: 'Gmail' },
  whatsapp: { bg: '#dcfce7', text: '#166534', label: 'WhatsApp' },
};

function getInitials(user_id) {
  if (!user_id) return 'UN';
  if (user_id.includes('@')) return user_id.slice(0, 2).toUpperCase();
  if (/^\d+$/.test(user_id)) return 'UN';
  return user_id.slice(0, 2).toUpperCase();
}

function getDisplayName(user_id, platform) {
  if (!user_id) return 'Unknown';
  if (user_id.includes('@')) return user_id;
  if (/^\d+$/.test(user_id)) return `${PLATFORM_COLORS[platform]?.label || 'User'} (${user_id.slice(-4)})`;
  return user_id;
}

const AVATAR_COLORS = ['#00c9a7', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981'];

export default function InboxScreen() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const filters = ['all', 'instagram', 'facebook', 'gmail', 'whatsapp'];

  const loadData = async () => {
    try {
      const res = await fetchConversations('', 200);
      const grouped = {};
      (res.data.conversations || []).sort((a, b) => (a.id || 0) - (b.id || 0)).forEach(msg => {
        const key = `${msg.platform}-${msg.user_id}`;
        if (!grouped[key]) grouped[key] = { ...msg, messages: [], latest_timestamp: msg.timestamp };
        grouped[key].messages.push(msg);
        grouped[key].latest_timestamp = msg.timestamp;
        if (msg.role === 'user') grouped[key].message = msg.message;
      });
      const list = Object.values(grouped).sort((a, b) => new Date(b.latest_timestamp) - new Date(a.latest_timestamp));
      setConversations(list);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = conversations.filter(c => filter === 'all' || c.platform === filter);

  if (selected) {
    const pc = PLATFORM_COLORS[selected.platform] || { bg: '#f3f4f6', text: '#6b7280', label: 'Unknown' };
    const avatarColor = AVATAR_COLORS[(selected.user_id?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
    return (
      <View style={styles.container}>
        {/* Chat header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{getInitials(selected.user_id)}</Text>
          </View>
          <View style={{flex:1}}>
            <Text style={styles.chatName} numberOfLines={1}>{getDisplayName(selected.user_id, selected.platform)}</Text>
            <View style={[styles.badge, { backgroundColor: pc.bg }]}>
              <Text style={[styles.badgeText, { color: pc.text }]}>{pc.label}</Text>
            </View>
          </View>
        </View>
        {/* Messages */}
        <ScrollView style={styles.messages} contentContainerStyle={{padding: 16, gap: 8}}>
          {(selected.messages || [selected]).sort((a, b) => (a.id || 0) - (b.id || 0)).map((msg, i) => (
            <View key={i} style={[styles.msgRow, msg.role === 'assistant' && styles.msgRowRight]}>
              <View style={[styles.bubble, msg.role === 'assistant' ? styles.bubbleAI : styles.bubbleUser]}>
                <Text style={[styles.bubbleText, msg.role === 'assistant' && {color: '#fff'}]}>{msg.message}</Text>
                <Text style={[styles.bubbleTime, msg.role === 'assistant' && {color: 'rgba(255,255,255,0.6)'}]}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
      </View>
      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{gap: 8, paddingHorizontal: 16, paddingVertical: 10}}>
        {filters.map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterBtn, filter === f && styles.filterBtnActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f === 'all' ? 'All' : f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color="#00c9a7" style={{marginTop: 40}} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => i.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#00c9a7" />}
          ListEmptyComponent={<Text style={styles.emptyText}>No conversations</Text>}
          renderItem={({ item }) => {
            const pc = PLATFORM_COLORS[item.platform] || { bg: '#f3f4f6', text: '#6b7280', label: 'Unknown' };
            const avatarColor = AVATAR_COLORS[(item.user_id?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
            return (
              <TouchableOpacity style={styles.convRow} onPress={() => setSelected(item)}>
                <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                  <Text style={styles.avatarText}>{getInitials(item.user_id)}</Text>
                </View>
                <View style={{flex: 1}}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3}}>
                    <Text style={styles.convName} numberOfLines={1}>{getDisplayName(item.user_id, item.platform)}</Text>
                    <Text style={styles.convTime}>{new Date(item.latest_timestamp || item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
                  </View>
                  <Text style={styles.convMsg} numberOfLines={1}>{item.message}</Text>
                  <View style={[styles.badge, { backgroundColor: pc.bg, alignSelf: 'flex-start', marginTop: 4 }]}>
                    <Text style={[styles.badgeText, { color: pc.text }]}>{pc.label}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#0a1628', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', maxHeight: 52 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6' },
  filterBtnActive: { backgroundColor: '#00c9a7' },
  filterText: { fontSize: 12, color: '#6b7280', fontWeight: '500', textTransform: 'capitalize' },
  filterTextActive: { color: '#fff' },
  convRow: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  convName: { fontSize: 14, fontWeight: '600', color: '#1a1a2e', flex: 1 },
  convTime: { fontSize: 11, color: '#9ca3af' },
  convMsg: { fontSize: 13, color: '#6b7280' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: 14, marginTop: 40 },
  chatHeader: { backgroundColor: '#fff', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { padding: 4 },
  backText: { color: '#00c9a7', fontSize: 14, fontWeight: '600' },
  chatName: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  messages: { flex: 1, backgroundColor: '#f8fafc' },
  msgRow: { flexDirection: 'row', marginBottom: 8 },
  msgRowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  bubbleUser: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderBottomLeftRadius: 4 },
  bubbleAI: { backgroundColor: '#00c9a7', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: '#1a1a2e', lineHeight: 20 },
  bubbleTime: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
});