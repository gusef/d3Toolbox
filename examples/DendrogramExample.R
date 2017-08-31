require(Biobase)
require(RColorBrewer)
require(d3Toolbox)


ui <- fillPage(fillRow(
    d3DendrogramOutput("dend_test", width = "100%", height = "100%"),
    fillCol(
        d3DendrogramOutput("dend_test2", width = "100%", height = "100%"),
        plotOutput("dend_test_control", width = "100%", height = "100%"),
        h3(verbatimTextOutput("currentOutput")),
        tags$head(tags$script(src="d3-toolbox.js")),
        flex = c(4,6,1,1))
    )
)

server <- function(input, output, session) {
    output$dend_test <- renderd3Dendrogram({
        dat <- t(mtcars)
        hc01.col <- hcopt(dist(t(dat)),method="ward.D")
        dend <- as.dendrogram(hc01.col)
        d3Dendrogram(data=dend,
                     title = "My dendrogram",
                     subtitle = "with subtitle",
                     horiz=T)
    })

    output$dend_test2 <- renderd3Dendrogram({
        dat <- mtcars
        hc01.col <- hcopt(dist(t(dat)),method="ward.D")
        dend <- as.dendrogram(hc01.col)
        d3Dendrogram(data=dend,
                     lab_adj = 40,
                     classic = F,
                     title = "My dendrogram",
                     subtitle = "with subtitle",
                     callback="DendSelection")
    })

    output$dend_test_control <- renderPlot({
        dat <- t(mtcars)
        hc01.col <- hcopt(dist(t(dat)),method="ward.D")
        dend <- as.dendrogram(hc01.col)
        plot(dend, horiz=T)
    })

    output$currentOutput <- renderPrint({ print(input$DendSelection) })

}

shinyApp(ui, server)
