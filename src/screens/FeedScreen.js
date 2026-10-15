import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import { editMode } from '../domain/feed/postPermissions';
import { colors, shadows } from '../theme';

const filters = ['Todos', 'Nutrição', 'Pilates', 'Saúde Mental'];

const featuredPost = {
  id: 'post-nutrition-1',
  authorId: 'nutritionist-juliana',
  authorRole: 'nutritionist',
  mentionedUserIds: [],
};

export default function FeedScreen({ currentUser = { id: 'patient-ana', role: 'patient' } }) {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editRequested, setEditRequested] = useState(false);
  const [myPostText, setMyPostText] = useState('Hoje completei minha caminhada e cuidei um pouco mais de mim.');
  const [draft, setDraft] = useState(myPostText);
  const [editingMyPost, setEditingMyPost] = useState(false);
  const featuredEditMode = editMode(currentUser, featuredPost);

  function createPost() {
    Alert.alert('Nova publicação', 'A criação de publicações será habilitada conforme as permissões do perfil profissional.');
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Feed</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Criar publicação"
          onPress={createPost}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <AppIcon name="plus" active size={25} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map(filter => {
          const active = filter === activeFilter;
          return (
            <Pressable
              key={filter}
              accessibilityRole="tab"
              accessibilityLabel={`Filtrar por ${filter}`}
              accessibilityState={{ selected: active }}
              onPress={() => setActiveFilter(filter)}
              style={[styles.filter, active && styles.activeFilter]}
            >
              <Text style={[styles.filterText, active && styles.activeFilterText]}>{filter}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.post}>
        <View style={styles.authorRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>J</Text></View>
          <View style={styles.authorText}>
            <Text style={styles.author}>Dra. Juliana</Text>
            <Text style={styles.authorMeta}>Nutricionista · 2h</Text>
          </View>
        </View>

        <Text style={styles.postText}>
          Uma alimentação equilibrada é a base para mais energia e qualidade de vida. <Text style={styles.blueHeart}>♥</Text>
        </Text>

        {featuredEditMode !== 'none' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={featuredEditMode === 'direct' ? 'Editar publicação' : 'Solicitar edição da publicação'}
            disabled={editRequested}
            onPress={() => {
              if (featuredEditMode === 'direct') Alert.alert('Editar publicação', 'A edição será salva localmente até a integração com o backend.');
              else setEditRequested(true);
            }}
            style={({ pressed }) => [styles.editAction, pressed && styles.pressed, editRequested && styles.disabled]}
          >
            <Text style={styles.editActionText}>
              {editRequested ? 'Solicitação enviada' : featuredEditMode === 'direct' ? 'Editar publicação' : 'Solicitar edição'}
            </Text>
          </Pressable>
        )}

        <View style={styles.foodImage} accessibilityLabel="Ilustração de uma refeição saudável">
          <View style={styles.plate}>
            <Text style={styles.foodEmoji}>🥗</Text>
          </View>
          <View style={styles.foodCopy}>
            <Text style={styles.foodTitle}>Escolhas que cuidam de você</Text>
            <Text style={styles.foodSubtitle}>Variedade, equilíbrio e sabor.</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={styles.leftActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={liked ? 'Remover curtida' : 'Curtir publicação'}
              accessibilityState={{ selected: liked }}
              onPress={() => setLiked(value => !value)}
              style={styles.actionButton}
            >
              <Text style={[styles.actionHeart, liked && styles.liked]}>{liked ? '♥' : '♡'}</Text>
              <Text style={styles.count}>{liked ? 13 : 12}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Ver comentários" style={styles.actionButton}>
              <AppIcon name="comment" size={20} />
              <Text style={styles.count}>3</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Remover dos salvos' : 'Salvar publicação'}
            accessibilityState={{ selected: saved }}
            onPress={() => setSaved(value => !value)}
            style={styles.actionButton}
          >
            <Text style={[styles.bookmark, saved && styles.saved]}>{saved ? '◆' : '◇'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.postCompact}>
        <View style={styles.avatarPilates}><Text style={styles.avatarText}>P</Text></View>
        <View style={styles.compactContent}>
          <Text style={styles.author}>Equipe de Pilates</Text>
          <Text style={styles.authorMeta}>Pilates · ontem</Text>
          <Text style={styles.compactText}>Movimento consciente também é uma forma de autocuidado.</Text>
        </View>
      </View>

      {currentUser.role === 'patient' && (
        <View style={styles.myPost} accessibilityLabel="Minha publicação">
          <View style={styles.authorRowCompact}>
            <View style={styles.avatarPatient}><Text style={styles.avatarText}>A</Text></View>
            <View style={styles.compactContent}>
              <Text style={styles.author}>Ana</Text>
              <Text style={styles.authorMeta}>Minha publicação · hoje</Text>
            </View>
          </View>

          {editingMyPost ? (
            <TextInput
              accessibilityLabel="Texto da minha publicação"
              value={draft}
              onChangeText={setDraft}
              multiline
              style={styles.postInput}
            />
          ) : <Text style={styles.compactText}>{myPostText}</Text>}

          <View style={styles.myPostActions}>
            {editingMyPost ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar edição da minha publicação"
                  onPress={() => { setDraft(myPostText); setEditingMyPost(false); }}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Salvar minha publicação"
                  disabled={!draft.trim()}
                  onPress={() => { setMyPostText(draft.trim()); setEditingMyPost(false); }}
                  style={[styles.saveButton, !draft.trim() && styles.disabled]}
                >
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Editar minha publicação"
                onPress={() => setEditingMyPost(true)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Editar minha publicação</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  addButton: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primarySoft },
  filters: { gap: 8, paddingVertical: 18 },
  filter: { minHeight: 38, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#EEF2F7' },
  activeFilter: { backgroundColor: colors.primary },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  activeFilterText: { color: '#FFFFFF' },
  post: { overflow: 'hidden', borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  authorRow: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 12 },
  avatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#F8D8BA' },
  avatarPilates: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#D8E8FC' },
  avatarPatient: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#DDF1DF' },
  avatarText: { color: colors.text, fontSize: 17, fontWeight: '900' },
  authorText: { marginLeft: 11 },
  author: { color: colors.text, fontSize: 14, fontWeight: '800' },
  authorMeta: { marginTop: 2, color: colors.muted, fontSize: 11 },
  postText: { paddingHorizontal: 16, paddingBottom: 14, color: colors.text, fontSize: 15, lineHeight: 21 },
  editAction: { minHeight: 48, marginHorizontal: 16, marginBottom: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primarySoft },
  editActionText: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  disabled: { opacity: 0.58 },
  blueHeart: { color: colors.primary },
  foodImage: { minHeight: 190, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, backgroundColor: '#E7F5E9' },
  plate: { width: 118, height: 118, alignItems: 'center', justifyContent: 'center', borderRadius: 60, backgroundColor: '#FFFFFF', borderWidth: 8, borderColor: '#D5EAD9', transform: [{ rotate: '-7deg' }] },
  foodEmoji: { fontSize: 68 },
  foodCopy: { flex: 1, marginLeft: 18 },
  foodTitle: { color: '#25583B', fontSize: 18, lineHeight: 22, fontWeight: '900' },
  foodSubtitle: { marginTop: 8, color: '#547361', fontSize: 12, lineHeight: 17 },
  actions: { minHeight: 58, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leftActions: { flexDirection: 'row', gap: 8 },
  actionButton: { minWidth: 46, minHeight: 46, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionHeart: { color: colors.muted, fontSize: 24 },
  liked: { color: '#E94D65' },
  count: { marginLeft: 4, color: colors.muted, fontSize: 12, fontWeight: '600' },
  bookmark: { color: colors.muted, fontSize: 24 },
  saved: { color: colors.primary },
  postCompact: { marginTop: 14, flexDirection: 'row', padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  myPost: { marginTop: 14, padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  authorRowCompact: { flexDirection: 'row', alignItems: 'center' },
  compactContent: { flex: 1, marginLeft: 11 },
  compactText: { marginTop: 10, color: colors.text, fontSize: 14, lineHeight: 20 },
  postInput: { minHeight: 90, marginTop: 13, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.primary, color: colors.text, fontSize: 14, textAlignVertical: 'top' },
  myPostActions: { marginTop: 13, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  secondaryButton: { minHeight: 48, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primarySoft },
  secondaryButtonText: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  saveButton: { minHeight: 48, minWidth: 92, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primary },
  saveButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
