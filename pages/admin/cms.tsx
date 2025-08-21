import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { 
  Save, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  Search,
  Filter,
  Download,
  Upload,
  Globe,
  FileText,
  Settings
} from 'lucide-react'
import AnimatedButton from '@/components/ui/animated-button'
import AnimatedCard from '@/components/ui/animated-card'
import { CMSContent, ContentType, ContentQuery } from '@/lib/cms/content-types'
import { cn } from '@/lib/utils'

const CMS_API_URL = '/api/cms/content'

export default function CMSAdmin() {
  const router = useRouter()
  const [content, setContent] = useState<CMSContent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<CMSContent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [filters, setFilters] = useState<ContentQuery>({
    locale: 'en',
    orderBy: 'updatedAt',
    order: 'desc'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      // Simple auth check - in production use proper authentication
      const isAuth = localStorage.getItem('cms_auth') === 'true' || process.env.NODE_ENV === 'development'
      if (!isAuth) {
        const password = prompt('Enter CMS password:')
        if (password === 'admin' || password === process.env.NEXT_PUBLIC_CMS_PASSWORD) {
          localStorage.setItem('cms_auth', 'true')
        } else {
          router.push('/')
        }
      }
    }
    checkAuth()
  }, [router])

  // Load content
  useEffect(() => {
    loadContent()
  }, [filters])

  const loadContent = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        ...filters,
        search: searchTerm
      } as any).toString()
      
      const response = await fetch(`${CMS_API_URL}?${queryParams}`)
      const data = await response.json()
      setContent(data)
    } catch (error) {
      console.error('Failed to load content:', error)
      showMessage('error', 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSave = async (contentData: CMSContent) => {
    try {
      const method = contentData.id ? 'PUT' : 'POST'
      const response = await fetch(CMS_API_URL, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('cms_token') || 'dev'}`
        },
        body: JSON.stringify(contentData)
      })

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      showMessage('success', `Content ${contentData.id ? 'updated' : 'created'} successfully`)
      loadContent()
      setIsEditing(false)
      setSelectedContent(null)
    } catch (error) {
      console.error('Failed to save:', error)
      showMessage('error', 'Failed to save content')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) {
      return
    }

    try {
      const response = await fetch(`${CMS_API_URL}?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms_token') || 'dev'}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete content')
      }

      showMessage('success', 'Content deleted successfully')
      loadContent()
      setSelectedContent(null)
    } catch (error) {
      console.error('Failed to delete:', error)
      showMessage('error', 'Failed to delete content')
    }
  }

  const handleDuplicate = async (content: CMSContent) => {
    try {
      const { id, ...contentWithoutId } = content
      const duplicated = {
        ...contentWithoutId,
        slug: `${content.slug}-copy`,
        title: `${content.title} (Copy)`,
        status: 'draft' as const
      }

      await handleSave(duplicated as CMSContent)
    } catch (error) {
      console.error('Failed to duplicate:', error)
      showMessage('error', 'Failed to duplicate content')
    }
  }

  const handlePublish = async (content: CMSContent) => {
    try {
      await handleSave({
        ...content,
        status: content.status === 'published' ? 'draft' : 'published'
      })
    } catch (error) {
      console.error('Failed to change status:', error)
      showMessage('error', 'Failed to change content status')
    }
  }

  const getContentTypeIcon = (type: ContentType) => {
    const icons: Record<ContentType, React.ReactNode> = {
      page: <FileText className="w-4 h-4" />,
      hero: <Globe className="w-4 h-4" />,
      feature: <Settings className="w-4 h-4" />,
      pricing: <FileText className="w-4 h-4" />,
      testimonial: <FileText className="w-4 h-4" />,
      faq: <FileText className="w-4 h-4" />,
      solution: <FileText className="w-4 h-4" />,
      blog: <FileText className="w-4 h-4" />,
      'case-study': <FileText className="w-4 h-4" />,
      announcement: <FileText className="w-4 h-4" />,
      navigation: <FileText className="w-4 h-4" />,
      footer: <FileText className="w-4 h-4" />,
      global: <Settings className="w-4 h-4" />
    }
    return icons[type] || <FileText className="w-4 h-4" />
  }

  return (
    <>
      <Head>
        <title>CMS Admin - Projekt Susi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">CMS Admin</h1>
                <span className="ml-4 text-sm text-gray-500">
                  {content.length} items
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <AnimatedButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedContent(null)
                    setIsEditing(true)
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  New Content
                </AnimatedButton>
                
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/')}
                >
                  View Site
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={cn(
            "fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg",
            message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          )}>
            {message.text}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar - Content List */}
            <div className="col-span-4">
              {/* Filters */}
              <AnimatedCard className="mb-4 p-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadContent()}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <select
                      className="flex-1 px-3 py-2 border rounded-lg"
                      value={filters.type || ''}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value as ContentType || undefined })}
                    >
                      <option value="">All Types</option>
                      <option value="page">Page</option>
                      <option value="hero">Hero</option>
                      <option value="feature">Feature</option>
                      <option value="pricing">Pricing</option>
                      <option value="testimonial">Testimonial</option>
                      <option value="faq">FAQ</option>
                      <option value="blog">Blog</option>
                    </select>
                    
                    <select
                      className="flex-1 px-3 py-2 border rounded-lg"
                      value={filters.locale || 'en'}
                      onChange={(e) => setFilters({ ...filters, locale: e.target.value as 'de' | 'en' })}
                    >
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                    </select>
                    
                    <select
                      className="flex-1 px-3 py-2 border rounded-lg"
                      value={filters.status || ''}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                    >
                      <option value="">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </AnimatedCard>

              {/* Content List */}
              <AnimatedCard className="overflow-hidden">
                <div className="divide-y">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                  ) : content.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No content found</div>
                  ) : (
                    content.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                          selectedContent?.id === item.id && "bg-blue-50"
                        )}
                        onClick={() => {
                          setSelectedContent(item)
                          setIsEditing(false)
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {getContentTypeIcon(item.type)}
                              <h3 className="font-medium text-gray-900">{item.title}</h3>
                            </div>
                            <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                              <span className={cn(
                                "px-2 py-1 rounded-full",
                                item.status === 'published' ? 'bg-green-100 text-green-700' :
                                item.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              )}>
                                {item.status}
                              </span>
                              <span>{item.locale.toUpperCase()}</span>
                              <span>{item.type}</span>
                            </div>
                            {item.description && (
                              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </AnimatedCard>
            </div>

            {/* Main Content Area */}
            <div className="col-span-8">
              {selectedContent || isEditing ? (
                <AnimatedCard className="p-6">
                  {isEditing ? (
                    <ContentEditor
                      content={selectedContent}
                      onSave={handleSave}
                      onCancel={() => {
                        setIsEditing(false)
                        setSelectedContent(null)
                      }}
                    />
                  ) : (
                    <ContentViewer
                      content={selectedContent!}
                      onEdit={() => setIsEditing(true)}
                      onDelete={() => handleDelete(selectedContent!.id)}
                      onDuplicate={() => handleDuplicate(selectedContent!)}
                      onPublish={() => handlePublish(selectedContent!)}
                    />
                  )}
                </AnimatedCard>
              ) : (
                <AnimatedCard className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select content to view or edit
                  </h3>
                  <p className="text-gray-500">
                    Choose an item from the list or create new content
                  </p>
                </AnimatedCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Content Viewer Component
function ContentViewer({ 
  content, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onPublish 
}: {
  content: CMSContent
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onPublish: () => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>Type: {content.type}</span>
            <span>Locale: {content.locale.toUpperCase()}</span>
            <span>Version: {content.version}</span>
            <span>Updated: {new Date(content.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={onPublish}
            icon={content.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          >
            {content.status === 'published' ? 'Unpublish' : 'Publish'}
          </AnimatedButton>
          
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={onDuplicate}
            icon={<Copy className="w-4 h-4" />}
          >
            Duplicate
          </AnimatedButton>
          
          <AnimatedButton
            variant="primary"
            size="sm"
            onClick={onEdit}
            icon={<Edit2 className="w-4 h-4" />}
          >
            Edit
          </AnimatedButton>
          
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={onDelete}
            icon={<Trash2 className="w-4 h-4" />}
            className="text-red-600 hover:bg-red-50"
          >
            Delete
          </AnimatedButton>
        </div>
      </div>

      <div className="space-y-6">
        {content.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{content.description}</p>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Content</h3>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(content.content, null, 2)}
          </pre>
        </div>
        
        {content.metadata && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Metadata</h3>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(content.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

// Content Editor Component
function ContentEditor({ 
  content, 
  onSave, 
  onCancel 
}: {
  content: CMSContent | null
  onSave: (content: CMSContent) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<CMSContent>>(
    content || {
      type: 'page',
      locale: 'en',
      status: 'draft',
      title: '',
      description: '',
      slug: '',
      content: {},
      metadata: {}
    }
  )
  
  const [contentJson, setContentJson] = useState(
    JSON.stringify(formData.content || {}, null, 2)
  )
  
  const [metadataJson, setMetadataJson] = useState(
    JSON.stringify(formData.metadata || {}, null, 2)
  )

  const handleSubmit = () => {
    try {
      const contentData = JSON.parse(contentJson)
      const metadataData = JSON.parse(metadataJson)
      
      onSave({
        ...formData,
        content: contentData,
        metadata: metadataData
      } as CMSContent)
    } catch (error) {
      alert('Invalid JSON in content or metadata fields')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {content ? 'Edit Content' : 'Create Content'}
        </h2>
        
        <div className="flex items-center space-x-2">
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </AnimatedButton>
          
          <AnimatedButton
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            icon={<Save className="w-4 h-4" />}
          >
            Save
          </AnimatedButton>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.type || 'page'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentType })}
            >
              <option value="page">Page</option>
              <option value="hero">Hero</option>
              <option value="feature">Feature</option>
              <option value="pricing">Pricing</option>
              <option value="testimonial">Testimonial</option>
              <option value="faq">FAQ</option>
              <option value="solution">Solution</option>
              <option value="blog">Blog</option>
              <option value="case-study">Case Study</option>
              <option value="announcement">Announcement</option>
              <option value="navigation">Navigation</option>
              <option value="footer">Footer</option>
              <option value="global">Global</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locale *
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.locale || 'en'}
              onChange={(e) => setFormData({ ...formData, locale: e.target.value as 'de' | 'en' })}
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.status || 'draft'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.author || ''}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content (JSON) *
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
            rows={15}
            value={contentJson}
            onChange={(e) => setContentJson(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metadata (JSON)
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
            rows={10}
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}