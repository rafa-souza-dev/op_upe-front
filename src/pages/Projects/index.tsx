import { Comment } from "../../components/Comment";
import { Paginator } from "../../components/mui/Paginator";
import { Project } from "../../components/Project";
import { getTimeDifferenceFromNowPTBR } from "../../utils/formate-date";
import { ProjectsAside, ProjectsContainer, ProjectsContent, ProjectsFilterBox, ProjectsFilterDateForm, ProjectsFilterTags, ProjectsMain } from "./styles";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormEvent, useEffect, useState } from "react";
import { category } from "../../@types/props"
import { client } from "../../client/client";
import { Loader } from "../../components/Loader";
import { Dayjs } from 'dayjs';
import { Faders, MagnifyingGlass, XCircle } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import { Dialog } from "@mui/material";

type ProjectData = {
    id: number
    titulo: string
    areaTematica: category
    autor: string
    imagemUrl?: string
    introducao: string
    dataInicio: Date
}

type ProjectResponse = {
    projetos: ProjectData[]
    totalPaginas: number
    totalItens: number
    paginaAtual: number
}

type ProjectsFilterDTO = {
    titulo?: string,
    areaTematica?: string,
    dataFim?: string,
    dataInicio?: string,
    modalidade?: string,
    page: number,
    size: number
}

type FilterTag = {
    name: string
    value: string | number
    initialSetter: () => void
}

export function Projects() {
    const [isLoadingProjectsRequest, setIsLoadingProjectsRequest] = useState(true)
    const [projectsData, setProjectsData] = useState<ProjectResponse>({
        projetos: [],
        paginaAtual: 0,
        totalItens: 0,
        totalPaginas: 0
    })
    const [titleValue, setTitleValue] = useState('')
    const [initialDateValue, setInicialDateValue] = useState<Dayjs | null>(null);
    const [finalDateValue, setFinalDateValue] = useState<Dayjs | null>(null);
    const [projectFilterDTO, setProjectFilterDTO] = useState<ProjectsFilterDTO>({
        size: 5,
        page: 0
    })
    const [projectsPage, setProjectsPage] = useState(1)
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedModality, setSelectedModality] = useState("")
    const [recentProjects, setRecentProjects] = useState<ProjectData[]>([])
    const [isOpenDialog, setIsOpenDialog] = useState(false)

    function incrementProjectsFilterUrl(projectFilterDTO: ProjectsFilterDTO) {
        let url = '/projeto/filtro'

        const entries = Object.entries(projectFilterDTO)

        if (entries.length > 0) {
            url += '?'
        }

        entries.forEach(entrie => {
            if (
                entrie[1] !== '' && 
                entrie[1] !== 0 &&
                entrie[1] !== undefined
            ) {
                url += `${entrie[0]}=${entrie[1]}&`
            }
        })

        if (url.endsWith('&')) {
            url = url.slice(0, url.length - 1)
        }

        return url
    }

    async function fetchProjects(url: string) {
        setIsLoadingProjectsRequest(true)

        await client
            .get(url)
            .then(res => {
                const data: ProjectResponse = res.data

                if (
                    data.totalPaginas < projectsPage &&
                    data.totalPaginas !== 0
                ) {
                    setProjectsPage(1)
                    
                    setProjectFilterDTO(state => ({
                        ...state,
                        page: 0
                    }))
                }

                setProjectsData(data)
                setIsLoadingProjectsRequest(false)
            })
            .catch(err => {
                setIsLoadingProjectsRequest(false)
                console.log(err)
            })
    }

    async function fetchRecentProjects() {
        await client
            .get('/projeto/recentes')
            .then(res => {
                const data: ProjectData[] = res.data

                setRecentProjects(data)
            })
            .catch(e => console.log(e))
    }

    useEffect(() => {
        fetchRecentProjects()
    }, [])

    useEffect(() => {
        const url = incrementProjectsFilterUrl(projectFilterDTO)

        fetchProjects(url)
    }, [projectFilterDTO])

    useEffect(() => {
        window.scroll({
            top: 0,
            behavior: 'smooth',
        })
    }, [projectsPage, isLoadingProjectsRequest])

    const handleOpenDialog = () => {
        setIsOpenDialog(true)
    }
    
    const handleCloseDialog = () => {
        setIsOpenDialog(false)
    };

    function validateDayjsDate(date: Dayjs | null): boolean {
        const result = date?.format('DD-MM-YYYY')

        if (result !== 'Invalid Date' && result !== undefined) {
            return true
        }

        return false
    }

    function handleSubmitFilterDate(event: FormEvent) {
        event.preventDefault();

        const formattedInitialDate = initialDateValue?.format('YYYY-MM-DD')
        const formattedFinalDate = finalDateValue?.format('YYYY-MM-DD')

        setProjectFilterDTO(state => ({
            ...state,
            dataInicio: formattedInitialDate,
            dataFim: formattedFinalDate
        }))
    }

    function handleSubmitTitleFilterForm(event: FormEvent) {
        event.preventDefault();

        setProjectFilterDTO(state => ({
            ...state,
            titulo: titleValue
        }))
    }

    function handleChangeSelectedCategory(category: string) {
        setProjectFilterDTO(state => {
            if (category === '') {
                const { areaTematica, ...rest } = state
    
                return {
                    ...rest
                }
            }

            return {
                ...state,
                areaTematica: category
            }
        })
    }

    function handleChangeSelectedModality(modality: string) {
        setProjectFilterDTO(state => {
            if (modality === '') {
                const { modalidade, ...rest } = state
    
                return {
                    ...rest
                }
            }

            return {
                ...state,
                modalidade: modality
            }
        })
    }

    function handleChangePage(_: React.ChangeEvent<unknown>, value: number) {
        setProjectsPage(value)

        setProjectFilterDTO(state => ({
            ...state,
            page: value - 1
        }))
    }

    function handleRemoveFilters() {
        setTitleValue('')
        setSelectedCategory('')
        setSelectedModality('')
        setInicialDateValue(null)
        setFinalDateValue(null)

        setProjectFilterDTO(state => ({
            size: 5,
            page: state.page
        }))
    }

    function setInitialTitleValue() {
        setTitleValue('')

        setProjectFilterDTO(state => {
            const { titulo, ...rest } = state

            return {
                ...rest
            }
        })
    }

    function setInitialDatesValue() {
        setInicialDateValue(null)
        setFinalDateValue(null)

        setProjectFilterDTO(state => {
            const { dataInicio, dataFim, ...rest } = state

            return {
                ...rest
            }
        })
    }

    function setInitialCategoryValue() {
        setSelectedCategory('')

        setProjectFilterDTO(state => {
            const { areaTematica, ...rest } = state

            return {
                ...rest
            }
        })
    }

    function setInitialModalityValue() {
        setSelectedModality('')

        setProjectFilterDTO(state => {
            const { modalidade, ...rest } = state

            return {
                ...rest
            }
        })
    }

    function getInitialSetterByTagName(name: string) {
        switch(name) {
            case "titulo":
                return setInitialTitleValue
            case "modalidade":
                return setInitialModalityValue
            case "areaTematica":
                return setInitialCategoryValue
            case "date":
                return setInitialDatesValue
            default:
                return () => {}
        }
    }

    function getFilterTags() {
        const entries = Object.entries(projectFilterDTO)
        const validKeys = ['titulo', 'modalidade', 'areaTematica']

        const validEntries = entries.filter(entrie => (
            validKeys.includes(entrie[0])
        ))

        const tags: FilterTag[] = validEntries.map(entrie => ({
            name: entrie[0],
            value: entrie[1],
            initialSetter: getInitialSetterByTagName(entrie[0])
        }))

        if (projectFilterDTO.dataInicio && projectFilterDTO.dataFim) {
            tags.push({
                name: 'date',
                value: `${projectFilterDTO.dataInicio} ~ ${projectFilterDTO.dataFim}`,
                initialSetter: getInitialSetterByTagName('date')
            })
        }

        return tags
    }

    function renderFilterBox() {
        return (
            <ProjectsAside>
                <header className="handle-close-header">
                    <h1>Caixa de Filtros</h1>
                    <XCircle 
                        size={32}
                        onClick={handleCloseDialog}
                    />
                </header>
                <ProjectsFilterBox>
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value)
                            handleChangeSelectedCategory(e.target.value)
                        }}
                        disabled={isLoadingProjectsRequest} 
                        name="select-categories" 
                        id="select-categories"
                    >
                        <option value="">Escolha uma Categoria</option>
                        <option value="EXTENSAO">Extensão</option>
                        <option value="INOVACAO">Inovação</option>
                        <option value="PESQUISA">Pesquisa</option>
                    </select>
                    <select
                        value={selectedModality}
                        onChange={(e) => {
                            setSelectedModality(e.target.value)
                            handleChangeSelectedModality(e.target.value)
                        }}
                        disabled={isLoadingProjectsRequest} 
                        name="select-modalities" 
                        id="select-modalities"
                    >
                        <option value="">Escolha uma Modalidade</option>
                        <option value="PROGRAMA">Programa</option>
                        <option value="PROJETO">Projeto</option>
                        <option value="CURSO">Curso</option>
                        <option value="OFICINA">Oficina</option>
                        <option value="EVENTO">Evento</option>
                        <option value="INDEFINIDO">Indefinido</option>
                    </select>
                    <ProjectsFilterDateForm onSubmit={handleSubmitFilterDate}>
                        <h4>Filtre por Data</h4>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker
                                    disabled={isLoadingProjectsRequest}
                                    format="YYYY / MM / DD" 
                                    label="Data Inicial" 
                                    sx={{ width: "100%" }}
                                    value={initialDateValue}
                                    onChange={(dateObject) => setInicialDateValue(dateObject)}
                                />
                            </DemoContainer>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker
                                    disabled={isLoadingProjectsRequest}
                                    format="YYYY / MM / DD"
                                    label="Data Final" 
                                    sx={{ width: "100%" }}
                                    value={finalDateValue}
                                    onChange={(dateObject) => setFinalDateValue(dateObject)}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                        <button 
                            disabled={dateInputHasInvalidDate || isLoadingProjectsRequest} 
                            className="filter-date-button" 
                            type="submit"
                        >
                            Filtrar
                        </button>
                    </ProjectsFilterDateForm>
                </ProjectsFilterBox>
                {
                    recentProjects.length > 0 &&
                    <>
                        <span>Posts Recentes</span>
                        <ul>
                            {
                                recentProjects.slice(0, 5).map(project => (
                                    <li 
                                        key={project.id}
                                    >
                                        <NavLink to={'/projetos/' + project.id}>
                                            {project.titulo}
                                        </NavLink>
                                    </li>
                                ))
                            }
                        </ul>
                    </>
                }
            </ProjectsAside>
        )
    }

    const dateInputHasInvalidDate = !validateDayjsDate(initialDateValue) ||
        !validateDayjsDate(finalDateValue)

    const isProjectFilterDTOEmpty = Object.values(projectFilterDTO).length === 2

    const filterTags = getFilterTags()

    return (
        <ProjectsContainer>
            <ProjectsContent>
                {renderFilterBox()}
                <ProjectsMain>
                    <form
                        onSubmit={handleSubmitTitleFilterForm}
                        action="" 
                        className="title-filter-form"
                    >
                        <div>
                            <input
                                maxLength={40}
                                disabled={isLoadingProjectsRequest}
                                type="text" 
                                placeholder="Escreva um título..."
                                value={titleValue}
                                onChange={(e) => setTitleValue(e.target.value)}
                            />
                            <button
                                className="submit-button"
                                type="submit"
                                disabled={titleValue === '' || isLoadingProjectsRequest ? true : false}
                            >
                                <MagnifyingGlass />
                            </button>
                            <button
                                type="button"
                                className="open-filter-box-button"
                                onClick={handleOpenDialog}
                            >
                                <Faders />
                            </button>
                        </div>
                        {
                            !isProjectFilterDTOEmpty &&
                            <button
                                type="button"
                                onClick={handleRemoveFilters}
                                disabled={isLoadingProjectsRequest}
                            >
                                <p>Remover Filtros</p>
                                <XCircle />
                            </button>
                        }
                    </form>
                    {
                        (
                            isLoadingProjectsRequest && 
                            isProjectFilterDTOEmpty &&
                            projectsData.projetos.length === 0
                        )

                        || 
                        
                        (
                            isLoadingProjectsRequest &&
                            projectsData.projetos.length === 0 &&
                            projectsPage === 1
                        )

                        ?
                            <Loader />
                        :

                        <>
                            {
                                filterTags.length > 0 &&
                                <ProjectsFilterTags
                                    aria-disabled={isLoadingProjectsRequest}
                                >
                                    {
                                        filterTags.map(filterTag => (
                                            <li 
                                                key={filterTag.name}
                                                onClick={filterTag.initialSetter}
                                            >
                                                <p>{filterTag.value}</p>
                                                <XCircle />
                                            </li>
                                        ))
                                    }
                                </ProjectsFilterTags>
                            }
                            {
                                projectsData.projetos.length !== 0 ?
                                <ul aria-disabled={isLoadingProjectsRequest} className="projects-list">
                                    {
                                        projectsData.projetos.map(project => (
                                            <li key={project.id}>
                                                <Project 
                                                    id={project.id}
                                                    authorName={project.autor}
                                                    category={project.areaTematica}
                                                    createdAt={new Date(project.dataInicio)}
                                                    introduction={project.introducao}
                                                    title={project.titulo}
                                                />
                                            </li>
                                        ))
                                    }
                                </ul>
                                :
                                <h1>Não encontramos nenhum projeto...</h1>
                            }
                            <Paginator
                                disabled={isLoadingProjectsRequest}
                                page={projectsPage} 
                                count={projectsData.totalPaginas} 
                                handleChange={handleChangePage} 
                            />
                        </>
                    }
                </ProjectsMain>
            </ProjectsContent>
            <Dialog
                open={isOpenDialog}
                onClose={handleCloseDialog}
            >
                {renderFilterBox()}
            </Dialog>
        </ProjectsContainer>
    )
}
