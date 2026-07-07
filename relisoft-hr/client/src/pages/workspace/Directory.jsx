import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Users, Building2, ChevronDown, ChevronRight, Briefcase, Loader2, User, ArrowUpDown, ArrowUp, ArrowDown, Edit3, X, Check, Save } from 'lucide-react'
import { workspaceAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Directory() {
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('tree')
  const [sortKey, setSortKey] = useState('fullName')
  const [sortDir, setSortDir] = useState('asc')
  const [expandedProjects, setExpandedProjects] = useState({})
  const [expandedTeams, setExpandedTeams] = useState({})
  const [filters, setFilters] = useState({})
  const [editEmp, setEditEmp] = useState(null)

  const canEdit = user?.roleValue >= 4 || ['admin', 'hr', 'superadmin'].includes(user?.role)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const res = await workspaceAPI.getDirectory()
      setData(res.data)
      const initProjects = {}
      const initTeams = {}
      for (const p of res.data.projects || []) {
        initProjects[p.id] = true
        for (const t of p.teams || []) initTeams[t.id] = true
      }
      setExpandedProjects(initProjects)
      setExpandedTeams(initTeams)
    } catch (err) {
      console.error('Failed to load directory', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filteredEmployees = useMemo(() => {
    if (!data?.employees) return []
    let items = [...data.employees]

    if (search) {
      const q = search.toLowerCase()
      items = items.filter(e =>
        e.fullName?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q) ||
        e.employeeCode?.toLowerCase().includes(q) ||
        e.jobRole?.toLowerCase().includes(q) ||
        e.roleLabel?.toLowerCase().includes(q)
      )
    }

    for (const [key, val] of Object.entries(filters)) {
      if (!val) continue
      const q = val.toLowerCase()
      items = items.filter(e => {
        const v = e[key]
        return v && String(v).toLowerCase().includes(q)
      })
    }

    items.sort((a, b) => {
      const av = (a[sortKey] || '').toString().toLowerCase()
      const bv = (b[sortKey] || '').toString().toLowerCase()
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })

    return items
  }, [data, search, filters, sortKey, sortDir])

  const employeesByTeam = useMemo(() => {
    const map = {}
    for (const emp of data?.employees || []) {
      for (const team of emp.teams || []) {
        if (!map[team.id]) map[team.id] = []
        map[team.id].push(emp)
      }
    }
    return map
  }, [data])

  const employeesWithoutTeams = useMemo(() => {
    return (data?.employees || []).filter(e => !e.teams || e.teams.length === 0)
  }, [data])

  const handleEditSave = async () => {
    if (!editEmp) return
    try {
      await workspaceAPI.updateEmployee(editEmp.id, editEmp)
      toast.success('Employee updated')
      setEditEmp(null)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    }
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 text-gray-300 ml-1" />
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-relisoft-600 ml-1" /> : <ArrowDown className="h-3 w-3 text-relisoft-600 ml-1" />
  }

  const filterInput = (key, placeholder) => (
    <input value={filters[key] || ''} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
      placeholder={placeholder} className="w-full text-[11px] px-1.5 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-relisoft-600 outline-none bg-gray-50"
      onClick={e => e.stopPropagation()} />
  )

  const columns = [
    { key: 'employeeCode', label: 'Code', sortable: true, filterable: true },
    { key: 'fullName', label: 'Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    { key: 'department', label: 'Department', sortable: true, filterable: true },
    { key: 'designation', label: 'Designation', sortable: true, filterable: true },
    { key: 'jobRole', label: 'Job Role', sortable: true, filterable: true },
    { key: 'roleLabel', label: 'Role', sortable: true, filterable: true },
    { key: 'employmentType', label: 'Type', sortable: true, filterable: true },
    { key: 'workLocation', label: 'Location', sortable: true, filterable: true },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-relisoft-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization Directory</h1>
            <p className="text-gray-500 mt-1">{data?.employees?.length || 0} employees across {data?.projects?.length || 0} projects</p>
          </div>
          <div className="flex space-x-2 bg-white rounded-lg border border-gray-200 p-0.5">
            <button onClick={() => setView('tree')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${view === 'tree' ? 'bg-relisoft-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>Tree</button>
            <button onClick={() => setView('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${view === 'table' ? 'bg-relisoft-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>Table</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search across all fields..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
          </div>
        </div>

        {view === 'table' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {canEdit && <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase w-10"></th>}
                    {columns.map(col => (
                      <th key={col.key} className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase">
                        <button onClick={() => col.sortable && toggleSort(col.key)}
                          className="flex items-center hover:text-gray-700">
                          {col.label}
                          {col.sortable && <SortIcon col={col.key} />}
                        </button>
                        {col.filterable && filterInput(col.key, `Filter ${col.label}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.length === 0 ? (
                    <tr><td colSpan={columns.length + (canEdit ? 1 : 0)} className="text-center py-16 text-gray-400">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No employees found</p>
                    </td></tr>
                  ) : (filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 text-sm">
                      {canEdit && (
                        <td className="px-3 py-2.5">
                          {editEmp?.id === emp.id ? (
                            <div className="flex space-x-1">
                              <button onClick={handleEditSave} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save className="h-3.5 w-3.5" /></button>
                              <button onClick={() => setEditEmp(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="h-3.5 w-3.5" /></button>
                            </div>
                          ) : (
                            <button onClick={() => setEditEmp({ ...emp })} className="p-1 text-gray-400 hover:text-relisoft-600 hover:bg-relisoft-50 rounded">
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                      {columns.map(col => (
                        <td key={col.key} className="px-3 py-2.5 text-gray-700">
                          {editEmp?.id === emp.id ? (
                            <input value={editEmp[col.key] || ''} onChange={e => setEditEmp(e => ({ ...e, [col.key]: e.target.value }))}
                              className="w-full text-xs px-1.5 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-relisoft-600 outline-none" />
                          ) : col.key === 'fullName' ? (
                            <div className="flex items-center">
                              <div className="w-7 h-7 bg-relisoft-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                <span className="text-[10px] font-semibold text-relisoft-700">
                                  {emp.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NA'}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">{emp.fullName}</span>
                            </div>
                          ) : (
                            emp[col.key] || '--'
                          )}
                        </td>
                      ))}
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filteredEmployees.length} of {data?.employees?.length || 0} employees
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-relisoft-600" />
                Projects & Teams
              </h2>
              {data?.projects?.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button onClick={() => setExpandedProjects(p => ({ ...p, [project.id]: !p[project.id] }))}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      {expandedProjects[project.id] ? <ChevronDown className="h-4 w-4 text-gray-400 mr-2" /> : <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />}
                      <Briefcase className="h-5 w-5 text-relisoft-600 mr-2" />
                      <span className="font-semibold text-gray-900">{project.name}</span>
                      <span className="ml-2 text-xs text-gray-400">({project.teams?.length || 0} teams)</span>
                    </div>
                  </button>
                  {expandedProjects[project.id] && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {project.teams?.map((team) => (
                        <div key={team.id}>
                          <button onClick={() => setExpandedTeams(t => ({ ...t, [team.id]: !t[team.id] }))}
                            className="w-full flex items-center justify-between px-6 py-3 pl-12 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                              {expandedTeams[team.id] ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 mr-2" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400 mr-2" />}
                              <Users className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm font-medium text-gray-700">{team.name}</span>
                              <span className="ml-2 text-xs text-gray-400">({employeesByTeam[team.id]?.length || 0} members)</span>
                            </div>
                            {team.leadName && <span className="text-xs text-gray-500">Lead: {team.leadName}</span>}
                          </button>
                          {expandedTeams[team.id] && (
                            <div className="bg-gray-50 px-6 py-2 pl-16">
                              {(employeesByTeam[team.id] || []).length === 0 ? (
                                <p className="text-xs text-gray-400 py-2">No members in this team</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-2">
                                  {employeesByTeam[team.id]?.map((emp) => (
                                    <EmployeeCard key={emp.id} emp={emp} />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {(!project.teams || project.teams.length === 0) && (
                        <p className="px-6 py-3 text-sm text-gray-400 pl-12">No teams in this project</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-relisoft-600" />
                {search ? 'Search Results' : 'Quick View'}
              </h2>

              {search ? (
                <div className="space-y-2">
                  {filteredEmployees.length === 0 ? (
                    <p className="text-sm text-gray-400">No employees match your search</p>
                  ) : (
                    filteredEmployees.slice(0, 50).map(emp => (
                      <div key={emp.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
                        <EmployeeCard emp={emp} compact />
                      </div>
                    ))
                  )}
                  {filteredEmployees.length > 50 && (
                    <p className="text-xs text-gray-400 text-center">Showing 50 of {filteredEmployees.length} results</p>
                  )}
                </div>
              ) : (
                <>
                  {data?.orgRoles?.map((role) => {
                    const count = (data?.employees || []).filter(e => e.roleLabel === role.label).length
                    if (count === 0) return null
                    return (
                      <div key={role.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{role.label}</span>
                        <span className="text-xs bg-relisoft-100 text-relisoft-700 px-2 py-0.5 rounded-full">{count}</span>
                      </div>
                    )
                  })}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Projects</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{data?.projects?.length || 0}</span>
                  </div>
                  <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
                    <p className="text-xs text-amber-700 font-medium">Half-Day Policy</p>
                    <p className="text-sm text-amber-900 mt-1">
                      {data?.hrPolicy?.allowHalfDayLeave ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EmployeeCard({ emp, compact }) {
  return (
    <div className="flex items-center space-x-2.5">
      <div className={`flex-shrink-0 ${compact ? 'w-7 h-7' : 'w-9 h-9'} bg-relisoft-100 rounded-full flex items-center justify-center`}>
        <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-semibold text-relisoft-700`}>
          {emp.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NA'}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-900 truncate`}>{emp.fullName}</p>
        {!compact && (
          <>
            {emp.designation && <p className="text-xs text-gray-500 truncate">{emp.designation}</p>}
            <div className="flex items-center text-[10px] text-gray-400 mt-0.5 space-x-2">
              {emp.employeeCode && <span>{emp.employeeCode}</span>}
              {emp.department && <span>{emp.department}</span>}
            </div>
          </>
        )}
      </div>
      {!compact && emp.roleLabel && (
        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded whitespace-nowrap">{emp.roleLabel}</span>
      )}
    </div>
  )
}
