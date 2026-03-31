import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Folder, ChevronRight, UserPlus, Trash2 } from 'lucide-react'
import { getWorkspaces, createWorkspace, deleteWorkspace } from '../api/workspace.api'
import { getProjects, createProject, deleteProject } from '../api/project.api'
import { useWorkspaceStore } from '../store/workspaceStore'
import InviteMemberModal from '../components/InviteMemberModal'

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">Are you sure?</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore()

  const [showNewWorkspace, setShowNewWorkspace] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [inviteWorkspace, setInviteWorkspace] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data } = await getWorkspaces()
      if (data.length > 0 && !activeWorkspace) setActiveWorkspace(data[0])
      return data
    }
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', activeWorkspace?._id],
    queryFn: async () => {
      const { data } = await getProjects(activeWorkspace._id)
      return data
    },
    enabled: !!activeWorkspace
  })

  const { mutate: addWorkspace } = useMutation({
    mutationFn: createWorkspace,
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries(['workspaces'])
      setActiveWorkspace(data)
      setWorkspaceName('')
      setShowNewWorkspace(false)
      toast.success('Workspace created!')
    }
  })

  const { mutate: removeWorkspace } = useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: (_, id) => {
      queryClient.setQueryData(['workspaces'], (old = []) =>
        old.filter(w => w._id !== id)
      )
      if (activeWorkspace?._id === id) setActiveWorkspace(null)
      toast.success('Workspace deleted!')
      setConfirm(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete workspace')
      setConfirm(null)
    }
  })

  const { mutate: addProject } = useMutation({
    mutationFn: (data) => createProject(activeWorkspace._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects', activeWorkspace._id])
      setProjectName('')
      setShowNewProject(false)
      toast.success('Project created!')
    }
  })

  const { mutate: removeProject } = useMutation({
    mutationFn: deleteProject,
    onSuccess: (_, id) => {
      queryClient.setQueryData(['projects', activeWorkspace._id], (old = []) =>
        old.filter(p => p._id !== id)
      )
      toast.success('Project deleted!')
      setConfirm(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete project')
      setConfirm(null)
    }
  })

  const handleConfirmDelete = () => {
    if (confirm.type === 'workspace') removeWorkspace(confirm.id)
    if (confirm.type === 'project') removeProject(confirm.id)
  }

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-full transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your workspaces and projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Workspaces Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700 dark:text-slate-200">Workspaces</h2>
              <button
                onClick={() => setShowNewWorkspace(true)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                <Plus size={16} />
              </button>
            </div>

            {showNewWorkspace && (
              <div className="mb-3">
                <input
                  autoFocus
                  value={workspaceName}
                  onChange={e => setWorkspaceName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && workspaceName.trim())
                      addWorkspace({ name: workspaceName.trim() })
                    if (e.key === 'Escape') setShowNewWorkspace(false)
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  placeholder="Workspace name..."
                />
              </div>
            )}

            <div className="space-y-1">
              {workspaces.map(ws => (
                <div
                  key={ws._id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                    activeWorkspace?._id === ws._id
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <button
                    onClick={() => setActiveWorkspace(ws)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ws.color }}
                    />
                    <span className="truncate">{ws.name}</span>
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setInviteWorkspace(ws)}
                      className="p-1 rounded hover:bg-primary-100 dark:hover:bg-primary-900/50 text-slate-400 hover:text-primary-600 transition"
                      title="Invite member"
                    >
                      <UserPlus size={13} />
                    </button>
                    <button
                      onClick={() => setConfirm({ type: 'workspace', id: ws._id, name: ws.name })}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition"
                      title="Delete workspace"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {workspaces.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">
                  No workspaces yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Projects Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-700 dark:text-slate-200">
                {activeWorkspace ? `${activeWorkspace.name} — Projects` : 'Projects'}
              </h2>
              {activeWorkspace && (
                <button
                  onClick={() => setShowNewProject(true)}
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  <Plus size={16} /> New Project
                </button>
              )}
            </div>

            {showNewProject && (
              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <input
                  autoFocus
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && projectName.trim())
                      addProject({ name: projectName.trim() })
                    if (e.key === 'Escape') setShowNewProject(false)
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="Project name... (press Enter to create)"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map(project => (
                <div
                  key={project._id}
                  className="group p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-md transition relative bg-white dark:bg-slate-800"
                >
                  <button
                    onClick={() => setConfirm({ type: 'project', id: project._id, name: project.name })}
                    className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 transition"
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div
                    onClick={() => navigate(`/board/${project._id}`)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: project.color + '20' }}
                      >
                        <Folder size={20} style={{ color: project.color }} />
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-slate-300 group-hover:text-primary-500 transition mt-1 mr-6"
                      />
                    </div>
                    <h3 className="font-medium text-slate-800 dark:text-slate-100">{project.name}</h3>
                    {project.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {projects.length === 0 && activeWorkspace && (
                <div className="col-span-3 text-center py-16 text-slate-400">
                  <Folder size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No projects yet. Create your first one!</p>
                </div>
              )}

              {!activeWorkspace && (
                <div className="col-span-3 text-center py-16 text-slate-400">
                  <p>Select or create a workspace to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {inviteWorkspace && (
        <InviteMemberModal
          workspace={inviteWorkspace}
          onClose={() => setInviteWorkspace(null)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={
            confirm.type === 'workspace'
              ? `Delete workspace "${confirm.name}"? All projects inside will also be deleted.`
              : `Delete project "${confirm.name}"? All tasks inside will also be deleted.`
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}