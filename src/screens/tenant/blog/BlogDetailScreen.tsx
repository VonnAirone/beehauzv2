import React, { ReactElement } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, BookOpen, Calendar, User } from 'lucide-react-native';
import { TenantStackParamList } from '../../../navigation/types';
import { BlogPost } from '../../../data/sampleBlogPosts';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';

type BlogDetailScreenNavigationProp = StackNavigationProp<TenantStackParamList, 'BlogDetail'>;

interface BlogDetailRouteParams {
  blog: BlogPost;
}

export const BlogDetailScreen: React.FC = () => {
  const navigation = useNavigation<BlogDetailScreenNavigationProp>();
  const route = useRoute();
  const { blog } = route.params as BlogDetailRouteParams;

  const renderMarkdownContent = (content: string) => {
    // Simple markdown-to-React renderer for basic formatting
    const lines = content.split('\n');
    const elements: ReactElement[] = [];
    
    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        // H1 heading
        elements.push(
          <Text key={index} style={styles.h1}>
            {line.replace('# ', '')}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        // H2 heading
        elements.push(
          <Text key={index} style={styles.h2}>
            {line.replace('## ', '')}
          </Text>
        );
      } else if (line.startsWith('### ')) {
        // H3 heading
        elements.push(
          <Text key={index} style={styles.h3}>
            {line.replace('### ', '')}
          </Text>
        );
      } else if (line.startsWith('- ')) {
        // Bullet point
        elements.push(
          <Text key={index} style={styles.bulletPoint}>
            • {line.replace('- ', '')}
          </Text>
        );
      } else if (line.trim() === '') {
        // Empty line for spacing
        elements.push(
          <View key={index} style={styles.spacing} />
        );
      } else if (line.trim() !== '') {
        // Regular paragraph
        elements.push(
          <Text key={index} style={styles.paragraph}>
            {line}
          </Text>
        );
      }
    });
    
    return elements;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.gray[700]} />
        </TouchableOpacity>
        <Text style={[typography.textStyles.h3, styles.headerTitle]}>Blog</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image source={{ uri: blog.image }} style={styles.heroImage} />
        
        {/* Article Header */}
        <View style={styles.articleHeader}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{blog.category}</Text>
          </View>
          
          <Text style={styles.title}>{blog.title}</Text>
          
          {/* Article Meta */}
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <User size={16} color={colors.gray[500]} />
              <Text style={styles.metaText}>{blog.author}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Calendar size={16} color={colors.gray[500]} />
              <Text style={styles.metaText}>{blog.date}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <BookOpen size={16} color={colors.gray[500]} />
              <Text style={styles.metaText}>{blog.readTime}</Text>
            </View>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.articleContent}>
          {blog.content ? renderMarkdownContent(blog.content) : (
            <Text style={styles.paragraph}>{blog.excerpt}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: colors.gray[900],
    fontFamily: 'Figtree_600SemiBold',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: colors.gray[200],
  },
  articleHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  category: {
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.primary,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Figtree_700Bold',
    color: colors.gray[900],
    lineHeight: 32,
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[600],
  },
  articleContent: {
    padding: 20,
    paddingTop: 0,
  },
  // Markdown content styles
  h1: {
    fontSize: 24,
    fontFamily: 'Figtree_700Bold',
    color: colors.gray[900],
    marginTop: 24,
    marginBottom: 12,
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[800],
    marginTop: 20,
    marginBottom: 10,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[700],
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 16,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 16,
  },
  spacing: {
    height: 8,
  },
});