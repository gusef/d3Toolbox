require(Biobase)
require(RColorBrewer)
require(d3Toolbox)


ui <- fillPage(fillRow(
    d3DendrogramOutput("dend_test", width = "100%", height = "100%")),
    tags$head(tags$script(src="d3Dendrogram.js"))
)

server <- function(input, output, session) {
    output$dend_test <- renderd3Dendrogram({

        #dat <- readRDS('/Users/Daniel Gusenleitner/Dropbox (Partners HealthCare)/projects/nanostring/melanoma_pembro/melanoma_pembro_eSet.RDS')
        dat <- readRDS('/Users/gusef/Dropbox (Partners HealthCare)/projects/nanostring/melanoma_pembro/melanoma_pembro_eSet.RDS')
        
        
        dat <- exprs(dat)

        hc01.col <- hcopt(dist(t(dat)),method="ward.D")
        dend <- as.dendrogram(hc01.col)
        plot(dend)

        d3Dendrogram(dend)
    })



}

shinyApp(ui, server)
