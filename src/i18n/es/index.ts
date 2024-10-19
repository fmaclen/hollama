import en from '../en';
import type { BaseTranslation, Translation } from '../i18n-types';

const es = {
	...(en as Translation),
	allModels: 'Todos los modelos',
	allowConnections: 'Cambia la configuración de tu servidor para permitir conexiones desde',
	allowMixedContent: 'Permitir contenido mixto',
	areYouSureYouWantToDeleteAllKnowledge:
		'¿Estás seguro de que quieres eliminar todo el conocimiento?',
	areYouSureYouWantToDeleteAllSessions: '¿Estás seguro de que quieres eliminar todas las sesiones?',
	areYouSureYouWantToDeleteAllSettings: '¿Estás seguro de que quieres eliminar todos los ajustes?',
	areYouSureYouWantToLeave: '¿Estás seguro de que quieres salir?\nLa tarea en progreso se detendrá',
	assistant: 'Asistente',
	automaticallyCheckForUpdates: 'Buscar actualizaciones automáticamente',
	availableModels: 'Modelos disponibles',
	browseModels: 'Explorar la lista de modelos disponibles',
	cancel: 'Cancelar',
	cantConnectToOllamaServer: 'No se puede conectar al servidor de Ollama',
	checkBrowserExtensions:
		'También verifica que ninguna extensión del navegador esté bloqueando la conexión',
	checkNow: 'Comprobar ahora',
	checkingForUpdates: 'Buscando actualizaciones...',
	currentVersion: 'Versión actual',
	confirmDeletion: 'Confirmar eliminación',
	connected: 'Conectado',
	content: 'Contenido',
	copy: 'Copiar',
	couldntCheckForUpdates: 'No se pudo buscar actualizaciones automáticamente',
	couldntConnectToOllamaServer: 'No se pudo conectar al servidor de Ollama',
	creatingTunnel: 'Creando un túnel',
	dangerZone: 'Zona de peligro',
	dark: 'Oscuro',
	deleteAllKnowledge: 'Eliminar todo el conocimiento',
	deleteAllSessions: 'Eliminar todas las sesiones',
	deleteAllSettings: 'Eliminar todos los ajustes',
	deleteKnowledge: 'Eliminar conocimiento',
	deleteSession: 'Eliminar sesión',
	disconnected: 'Desconectado',
	dismiss: 'Descartar',
	downloadModel: 'Descargar modelo',
	edit: 'Editar',
	emptyKnowledge: 'Sin conocimiento',
	emptySessions: 'Sin sesiones',
	error: 'Error',
	genericError: 'Lo siento, algo salió mal.\n```\n{error:string}\n```',
	goToDownloads: 'Ir a descargas',
	goToKnowledge: 'Ir a conocimiento',
	goToReleases: 'Ir a versiones',
	howToUpdateDocker: '¿Cómo actualizar el contenedor Docker?',
	interface: 'Interfaz',
	internalServerError: 'Hubo un error interno del servidor, por favor intenta de nuevo más tarde',
	isCurrentVersionLatest: 'Estás en la última versión',
	isLatestVersion: 'Hay una versión más reciente disponible',
	knowledgeSaved: 'Conocimiento guardado',
	knowledge: 'Conocimiento',
	language: 'Idioma',
	lastUsedModels: 'Modelos utilizados recientemente',
	light: 'Claro',
	messageOfTheDay: 'Mensaje del día',
	modelWasDownloaded: '{model:string} fue descargado',
	motd: 'Mensaje del día',
	name: 'Nombre',
	newKnowledge: 'Nuevo conocimiento',
	newSession: 'Nueva sesión',
	noKnowledgeChosen: 'Crea un nuevo conocimiento o elige uno de la lista',
	noRecentModels: 'No hay modelos utilizados recientemente',
	noSessionChosen: 'Crea una nueva sesión o elige una existente de la lista',
	notFound: 'La página que estás buscando no existe',
	ollamaLibrary: 'Biblioteca de Ollama',
	otherModels: 'Otros modelos',
	prompt: 'Indicación',
	promptPlaceholder: 'Escribe literalmente cualquier cosa',
	pullModel: 'Obtener modelo',
	pullModelPlaceholder: 'Etiqueta del modelo (ej. llama3.1)',
	pullingModel: 'Obteniendo modelo',
	refreshToUpdate: 'Actualiza para actualizar',
	releaseHistory: 'Historial de versiones',
	retry: 'Reintentar',
	run: 'Ejecutar',
	save: 'Guardar',
	search: 'Buscar',
	searchEmpty: 'No se encontraron resultados',
	seeDocs: 'Ver documentación',
	server: 'Servidor',
	session: 'Sesión',
	sessions: 'Sesiones',
	settings: 'Ajustes',
	somethingWentWrong: 'Lo sentimos, algo salió mal',
	stopResponse: 'Detener respuesta',
	success: 'Éxito',
	system: 'Sistema',
	systemPrompt: 'Indicación del sistema',
	tryingToConnectNotLocalhost:
		'Si quieres conectarte a un servidor de Ollama que no está disponible en {hostname:string} o {ip:string} prueba',
	version: 'Versión',
	writePromptToStart: 'Escribe una indicación para comenzar una nueva sesión',
	you: 'Tú'
} satisfies BaseTranslation;

export default es;
