require(Biobase)
require(RColorBrewer)
require(d3Toolbox)


ui <- fillPage(fillRow(
    d3DendrogramOutput("dend_test", width = "100%", height = "100%"),
    fillCol(
        d3DendrogramOutput("dend_test2", width = "100%", height = "100%"),
        h3(verbatimTextOutput("currentOutput")),
        #tags$head(tags$script(src="d3Dendrogram.js")),
        flex = c(8,1,1))
    )
)

server <- function(input, output, session) {
    output$dend_test <- renderd3Dendrogram({
        dat <- t(mtcars)
        hc01.col <- hcopt(dist(t(dat)),method="ward.D")
        dend <- as.dendrogram(hc01.col)
        d3Dendrogram(dend,
                     horiz=T,
                     callback_handler="DendSelection")
    })

    output$dend_test2 <- renderd3Dendrogram({
        dat <- mtcars
        hc01.col <- hcopt(dist(t(dat)),method="ward.D")
        dend <- as.dendrogram(hc01.col)
        d3Dendrogram(dend,
                     lab_adj = 40,
                     classic_tree = F,
                     callback_handler="DendSelection")
    })

    output$currentOutput <- renderPrint({ print(input$DendSelection) })

}

shinyApp(ui, server)
